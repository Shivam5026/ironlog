import { prisma } from "../../../config/prisma";
import { getExerciseById } from "../../exercise/exerciseDb.service";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import type { CacheEntry } from "../../../lib/cache";
import { deleteCache, getCacheWithAge, setCacheWithTimestamp } from "../../../lib/cache";
import type {
  OvertrainingAnalysis,
  RecommendationOptions,
  TodayRecommendation,
  TrainingSplit,
} from "../types/recovery.types";
import {
  muscleToSplit,
  RecommendationCalculator,
} from "../utils/recommendation.calculator";

import {
  consecutiveTrainingDays,
} from "../utils/readiness.calculator";
import {
  resolveMuscleRoles,
  type ExerciseMetadataFetcher,
} from "../utils/muscleRoles";
import { ReadinessService } from "./readiness.service";
import { RecoveryService } from "./recovery.service";
import { recommendationKey } from "./recovery-cache.service";
import {
  OvertrainingService,
} from "./overtraining.service";

const MS_PER_DAY = 86_400_000;

export { recommendationKey };

/**
 * Recommendation Service (Feature 5.1)
 *
 * Produces today's workout recommendation by composing the existing engines:
 *   - readiness (Feature 4.1/4.2) for the overall readiness score and level;
 *   - the Epic 3 recovery summary for per-muscle recovery percentages;
 *   - a lightweight split classification of recent completed sessions for the
 *     training history (which split was last trained, and how often each).
 *
 * No fatigue or readiness math is reproduced here. The decision itself is
 * delegated to the pure RecommendationCalculator. Results are cached under a
 * user-scoped Redis key using the shared cache primitives so the endpoint
 * integrates with the existing recovery cache instead of introducing a
 * parallel caching layer. No new database tables are required.
 */

// ── Cache Backend ──────────────────────────────────────────────────

/** Storage contract for recommendation cache entries, mirroring the recovery cache. */
export interface RecommendationCacheBackend {
  get(userId: string): Promise<CacheEntry<TodayRecommendation> | null>;
  set(userId: string, recommendation: TodayRecommendation): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

/**
 * TTL for a cached recommendation. Defaults to the recovery cache TTL so the
 * two engines stay in sync, and can be tuned independently via
 * RECOMMENDATION_CACHE_TTL.
 */
export function recommendationCacheTtl(): number {
  return (
    Number(process.env.RECOMMENDATION_CACHE_TTL) ||
    Number(process.env.RECOVERY_CACHE_TTL) ||
    300
  );
}

const RECOMMENDATION_CACHE_TTL = recommendationCacheTtl();

/** Redis-backed implementation. Every method is failure-tolerant. */
export const redisRecommendationCacheBackend: RecommendationCacheBackend = {
  async get(userId) {
    return getCacheWithAge<TodayRecommendation>(recommendationKey(userId));
  },

  async set(userId, recommendation) {
    await setCacheWithTimestamp(
      recommendationKey(userId),
      recommendation,
      RECOMMENDATION_CACHE_TTL,
    );
  },

  async invalidate(userId) {
    await deleteCache(recommendationKey(userId));
  },
};

/**
 * Drops the cached recommendation for a single user. Call this wherever the
 * recovery summary is invalidated so a freshly completed workout is never
 * followed by a stale recommendation.
 */
export async function invalidateRecommendationCache(
  userId: string,
): Promise<void> {
  await deleteCache(recommendationKey(userId));
}

// ── Service ─────────────────────────────────────────────────────────

export interface RecommendationServiceDependencies {
  readiness?: ReadinessService;
  recovery?: RecoveryService;
  repository?: AnalyticsRepository;
  calculator?: RecommendationCalculator;
  /** Feature 5.3 overtraining detection, folded into the decision when risky. */
  overtraining?: OvertrainingService;
  fetchExerciseMetadata?: ExerciseMetadataFetcher;
  cache?: RecommendationCacheBackend;
}

export class RecommendationService {
  private readonly readiness: ReadinessService;
  private readonly recovery: RecoveryService;
  private readonly repository: AnalyticsRepository;
  private readonly calculator: RecommendationCalculator;
  private readonly overtraining: OvertrainingService;
  private readonly fetchExerciseMetadata: ExerciseMetadataFetcher;
  private readonly cache: RecommendationCacheBackend;

  constructor(deps: RecommendationServiceDependencies = {}) {
    this.readiness = deps.readiness ?? new ReadinessService();
    this.recovery = deps.recovery ?? new RecoveryService();
    this.repository = deps.repository ?? new AnalyticsRepository(prisma);
    this.calculator = deps.calculator ?? new RecommendationCalculator();
    this.overtraining = deps.overtraining ?? new OvertrainingService();
    this.fetchExerciseMetadata = deps.fetchExerciseMetadata ?? getExerciseById;
    this.cache = deps.cache ?? redisRecommendationCacheBackend;
  }

  /**
   * Returns today's recommendation for the user. Served from Redis when
   * cached; explicit reference times and config overrides bypass the cache
   * so a shared entry is never polluted (same policy as the recovery cache).
   */
  async getRecommendation(
    userId: string,
    options: RecommendationOptions = {},
  ): Promise<TodayRecommendation> {
    if (options.now || options.config) {
      return this.computeRecommendation(userId, options);
    }

    let cached: CacheEntry<TodayRecommendation> | null = null;
    try {
      cached = await this.cache.get(userId);
    } catch (error) {
      console.error("Recommendation cache read failed", error);
    }

    if (cached) return cached.value;

    const recommendation = await this.computeRecommendation(userId, options);
    try {
      await this.cache.set(userId, recommendation);
    } catch (error) {
      console.error("Recommendation cache write failed", error);
    }
    return recommendation;
  }

  /** Fresh, deterministic computation for a reference time. */
  private async computeRecommendation(
    userId: string,
    options: RecommendationOptions,
  ): Promise<TodayRecommendation> {
    const now = options.now ?? new Date();
    const calculator = options.config
      ? new RecommendationCalculator(options.config)
      : this.calculator;
    const config = calculator.getConfig();

    const readiness = await this.readiness.getDailyReadiness(userId, { now });
    const summary = await this.recovery.getRecoverySummary(userId, {
      now,
      fatigue: { config: { lookbackHours: config.recoveryWindowDays * 24 } },
    });

    const muscleRecovery = Object.fromEntries(
      MUSCLE_GROUPS.map((muscle) => {
        const entry = summary.muscles.find(
          (m) => m.muscle === muscle && m.lastTrainedAt !== null,
        );
        return [muscle, entry ? entry.recoveryPercentage : 100];
      }),
    ) as Record<MuscleGroup, number>;

    const splitHistory = await this.loadSplitHistory(
      userId,
      now,
      config.splitHistoryWindowDays,
    );

    const dates = (
      await this.repository.getCompletedSessionDates(userId, {
        startDate: new Date(now.getTime() - config.recoveryWindowDays * MS_PER_DAY),
      })
    )
      .map((session) => session.endedAt)
      .filter((date): date is Date => date instanceof Date);
    const streak = consecutiveTrainingDays(dates, now, config.recoveryWindowDays);

    const recommendation = calculator.calculate(
      {
        readinessScore: readiness.score,
        readinessLevel: readiness.level,
        muscleRecovery,
        splitSessionCounts: splitHistory.counts,
        lastTrainedSplit: splitHistory.lastTrainedSplit,
        consecutiveTrainingDays: streak,
      },
      now,
    );

    let overtraining: OvertrainingAnalysis;
    try {
      overtraining = await this.overtraining.getOvertrainingAnalysis(userId, {
        now,
      });
    } catch (error) {
      // Overtraining detection must never take the daily recommendation down.
      console.error("Overtraining analysis failed", error);
      return recommendation;
    }

    return this.applyOvertraining(recommendation, overtraining, now);
  }

  /**
   * Folds the Feature 5.3 analysis into the daily recommendation: a HIGH-risk
   * analysis downgrades a training day to active recovery (or a rest day when
   * the volume/heavy-session patterns are severe); a MODERATE analysis keeps
   * the plan but surfaces an caution in the reason. A single high-volume
   * workout alone never triggers this — only the configurable pattern rules do.
   */
  private applyOvertraining(
    recommendation: TodayRecommendation,
    overtraining: OvertrainingAnalysis,
    now: Date,
  ): TodayRecommendation {
    if (overtraining.riskLevel === "LOW" || overtraining.flags.length === 0) {
      return recommendation;
    }

    const isTrainingDay = recommendation.type.startsWith("TRAIN_");
    if (!isTrainingDay) return recommendation;

    if (overtraining.riskLevel === "HIGH") {
      const severe =
        overtraining.flags.some(
          (flag) =>
            flag.type === "EXCESSIVE_VOLUME" && flag.level === "HIGH",
        ) ||
        overtraining.flags.some(
          (flag) =>
            flag.type === "CONSECUTIVE_HEAVY_SESSIONS" && flag.level === "HIGH",
        );

      const message = overtraining.flags.map((flag) => flag.message).join(" ");
      if (severe) {
        return {
          ...recommendation,
          type: "REST_DAY",
          title: "Rest Day (Overtraining)",
          reason: `Overtraining detected — ${message}`,
          generatedAt: now.toISOString(),
        };
      }
      return {
        ...recommendation,
        type: "ACTIVE_RECOVERY",
        title: "Active Recovery (Overtraining)",
        reason: `Overtraining detected — ${message}`,
        generatedAt: now.toISOString(),
      };
    }

    const caution = overtraining.flags.map((flag) => flag.message).join(" ");
    return {
      ...recommendation,
      reason: `${recommendation.reason} Overtraining caution: ${caution}`,
      generatedAt: now.toISOString(),
    };
  }

  /**
   * Classifies recent completed sessions into their dominant training split
   * using the same exercise→muscle metadata pipeline as the fatigue engine.
   */
  private async loadSplitHistory(
    userId: string,
    now: Date,
    splitHistoryWindowDays: number,
  ): Promise<{
    counts: Record<TrainingSplit, number>;
    lastTrainedSplit: TrainingSplit | null;
  }> {
    const sessions = await this.repository.getSessionsWithExercises(userId, {
      startDate: new Date(now.getTime() - splitHistoryWindowDays * MS_PER_DAY),
    });

    const counts: Record<TrainingSplit, number> = { PUSH: 0, PULL: 0, LEGS: 0 };
    let lastTrainedSplit: TrainingSplit | null = null;
    let lastSessionAt = new Date(0);

    for (const session of sessions) {
      if (!session.endedAt) continue;

      const totals = { PUSH: 0, PULL: 0, LEGS: 0 };
      for (const log of session.exerciseLogs) {
        const roles = await resolveMuscleRoles(
          log.exerciseId,
          log.exerciseName,
          this.fetchExerciseMetadata,
        );
        addContribution(totals, roles.primary, 1);
        addContribution(totals, roles.secondary, 0.5);
        addContribution(totals, roles.stabilizer, 0.2);
      }

      const split = dominantSplit(totals);
      if (!split) continue;

      counts[split] += 1;
      if (session.endedAt.getTime() > lastSessionAt.getTime()) {
        lastSessionAt = session.endedAt;
        lastTrainedSplit = split;
      }
    }

    return { counts, lastTrainedSplit };
  }
}

function addContribution(
  totals: Record<TrainingSplit, number>,
  muscles: MuscleGroup[],
  weight: number,
): void {
  for (const muscle of muscles) {
    const split = muscleToSplit(muscle);
    if (split) totals[split] += weight;
  }
}

/**
 * Picks a session's dominant split from its weighted muscle-group totals.
 * Muscles shared across splits (e.g. core) simply add to each split they map
 * to, so ties resolve in the stable PUSH → PULL → LEGS order.
 */
function dominantSplit(
  totals: Record<TrainingSplit, number>,
): TrainingSplit | null {
  const order: TrainingSplit[] = ["PUSH", "PULL", "LEGS"];
  let best: TrainingSplit | null = null;
  let bestScore = 0;
  for (const split of order) {
    if (totals[split] > bestScore) {
      best = split;
      bestScore = totals[split];
    }
  }
  return best;
}

export const recommendationService = new RecommendationService();