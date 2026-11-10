import { prisma } from "../../../config/prisma";
import { getExerciseById } from "../../exercise/exerciseDb.service";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import type { CacheEntry } from "../../../lib/cache";
import { deleteCache, getCacheWithAge, setCacheWithTimestamp } from "../../../lib/cache";
import {
  MuscleContributionCalculator,
  DEFAULT_MUSCLE_CONTRIBUTION,
} from "../utils/muscle-contribution.calculator";
import {
  resolveMuscleRoles,
  type ExerciseMetadataFetcher,
} from "../utils/muscleRoles";
import {
  OvertrainingCalculator,
} from "../utils/overtraining.calculator";
import type {
  MuscleContributionWeights,
  OvertrainingAnalysis,
  OvertrainingOptions,
  OvertrainingSession,
} from "../types/recovery.types";

/**
 * Overtraining Detection Service (Feature 5.3)
 *
 * Gathers completed workout history (sessions, exercise logs, and sets) and
 * normalizes it into per-session volume, set counts, and contribution-weighted
 * per-muscle workload, then delegates the detection rules to the pure
 * OvertrainingCalculator. Reuses the Epic 2 muscle-metadata pipeline and the
 * Feature 2.2 contribution weights; no fatigue or readiness math is reproduced
 * here and no new database tables are required.
 *
 * Results are cached under a user-scoped key using the shared cache primitives,
 * mirroring the recovery and recommendation caches, and are invalidated
 * wherever a completed workout changes the underlying data.
 */

// ── Cache Backend ──────────────────────────────────────────────────

/** Storage contract for overtraining cache entries. */
export interface OvertrainingCacheBackend {
  get(userId: string): Promise<CacheEntry<OvertrainingAnalysis> | null>;
  set(userId: string, analysis: OvertrainingAnalysis): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

/** TTL fallback mirrors the recovery/recommendation caches. */
export function overtrainingCacheTtl(): number {
  return (
    Number(process.env.OVERTRAINING_CACHE_TTL) ||
    Number(process.env.RECOMMENDATION_CACHE_TTL) ||
    Number(process.env.RECOVERY_CACHE_TTL) ||
    300
  );
}

export function overtrainingKey(userId: string): string {
  return `overtraining:today:${userId}`;
}

const OVERTRAINING_CACHE_TTL = overtrainingCacheTtl();

/** Redis-backed implementation. Every method is failure-tolerant. */
export const redisOvertrainingCacheBackend: OvertrainingCacheBackend = {
  async get(userId) {
    return getCacheWithAge<OvertrainingAnalysis>(overtrainingKey(userId));
  },

  async set(userId, analysis) {
    await setCacheWithTimestamp(
      overtrainingKey(userId),
      analysis,
      OVERTRAINING_CACHE_TTL,
    );
  },

  async invalidate(userId) {
    await deleteCache(overtrainingKey(userId));
  },
};

/**
 * Drops the cached overtraining analysis for a single user. Call this wherever
 * the recommendation cache is invalidated so a freshly completed workout never
 * leaves a stale overtraining analysis behind.
 */
export async function invalidateOvertrainingCache(
  userId: string,
): Promise<void> {
  await deleteCache(overtrainingKey(userId));
}

// ── Service ─────────────────────────────────────────────────────────

export interface OvertrainingServiceDependencies {
  repository?: AnalyticsRepository;
  calculator?: OvertrainingCalculator;
  fetchExerciseMetadata?: ExerciseMetadataFetcher;
  contributionWeights?: Partial<MuscleContributionWeights>;
  /** Loads and normalizes completed sessions. Inject for tests. */
  loadSessions?: (
    userId: string,
    since: Date,
    now: Date,
  ) => Promise<OvertrainingSession[]>;
  cache?: OvertrainingCacheBackend;
}

export class OvertrainingService {
  private readonly repository: AnalyticsRepository;
  private readonly calculator: OvertrainingCalculator;
  private readonly fetchExerciseMetadata: ExerciseMetadataFetcher;
  private readonly contributionCalculator: MuscleContributionCalculator;
  private readonly loadSessions: NonNullable<OvertrainingServiceDependencies["loadSessions"]>;
  private readonly cache: OvertrainingCacheBackend;

  constructor(deps: OvertrainingServiceDependencies = {}) {
    this.repository = deps.repository ?? new AnalyticsRepository(prisma);
    this.calculator = deps.calculator ?? new OvertrainingCalculator();
    this.fetchExerciseMetadata = deps.fetchExerciseMetadata ?? getExerciseById;
    this.contributionCalculator = new MuscleContributionCalculator(
      deps.contributionWeights ?? DEFAULT_MUSCLE_CONTRIBUTION,
    );
    this.loadSessions = deps.loadSessions ?? this.loadSessionsFromHistory;
    this.cache = deps.cache ?? redisOvertrainingCacheBackend;
  }

  /**
   * Normalizes completed sessions into per-session volume, set counts, and
   * contribution-weighted per-muscle workload. Incomplete and warmup sets are
   * excluded, matching the fatigue engine, and unwritable metadata degrades to
   * a neutral contribution rather than crashing.
   */
  private async loadSessionsFromHistory(
    userId: string,
    since: Date,
    _now: Date,
  ): Promise<OvertrainingSession[]> {
    const logs = await this.repository.getVolumeData(userId, {
      startDate: since,
    });

    const sessions: OvertrainingSession[] = [];

    for (const session of logs) {
      if (!(session.endedAt instanceof Date)) continue;

      let volume = 0;
      let sets = 0;
      const muscleWorkload = Object.fromEntries(
        MUSCLE_GROUPS.map((muscle) => [muscle, 0]),
      ) as Record<MuscleGroup, number>;
      const musclesTrained = new Set<MuscleGroup>();

      for (const log of session.exerciseLogs) {
        let logVolume = 0;
        let logSets = 0;
        for (const set of log.sets) {
          if (set.setType !== "WORKING") continue;
          const weight = Number(set.weight);
          if (!Number.isFinite(weight) || weight <= 0) continue;
          if (set.reps <= 0) continue;
          logVolume += weight * set.reps;
          logSets += 1;
        }
        if (logSets === 0) continue;

        const roles = await resolveMuscleRoles(
          log.exerciseId,
          log.exerciseName,
          this.fetchExerciseMetadata,
        );

        const contributions = this.contributionCalculator.distribute({
          totalVolume: logVolume,
          completedSets: logSets,
          primaryMuscles: roles.primary,
          secondaryMuscles: roles.secondary,
          stabilizerMuscles: roles.stabilizer,
        });

        for (const contribution of contributions) {
          muscleWorkload[contribution.muscle] += contribution.weightedVolume;
          musclesTrained.add(contribution.muscle);
        }

        volume += logVolume;
        sets += logSets;
      }

      if (sets === 0 && volume === 0) continue;

      sessions.push({
        endedAt: session.endedAt,
        volume,
        sets,
        muscleWorkload,
        musclesTrained: Array.from(musclesTrained),
      });
    }

    return sessions;
  }

  /**
   * Public access to the per-session normalization (volume, sets, and
   * contribution-weighted per-muscle workload) used by other analytics
   * consumers such as recovery trends. Keeps the Epic 2 set filtering and the
   * Feature 2.2 contribution weights in a single, shared code path.
   */
  async loadCompletedSessions(
    userId: string,
    since: Date,
    now: Date,
  ): Promise<OvertrainingSession[]> {
    return this.loadSessions(userId, since, now);
  }

  /**
   * Returns today's overtraining analysis. Served from Redis when cached;
   * explicit reference times and config overrides bypass the cache so a shared
   * entry is never polluted (same policy as the recovery cache).
   */
  async getOvertrainingAnalysis(
    userId: string,
    options: OvertrainingOptions = {},
  ): Promise<OvertrainingAnalysis> {
    if (options.now || options.config) {
      return this.computeOvertraining(userId, options);
    }

    let cached: CacheEntry<OvertrainingAnalysis> | null = null;
    try {
      cached = await this.cache.get(userId);
    } catch (error) {
      console.error("Overtraining cache read failed", error);
    }

    if (cached) return cached.value;

    const analysis = await this.computeOvertraining(userId, options);
    try {
      await this.cache.set(userId, analysis);
    } catch (error) {
      console.error("Overtraining cache write failed", error);
    }
    return analysis;
  }

  /** Fresh, deterministic computation for a reference time. */
  private async computeOvertraining(
    userId: string,
    options: OvertrainingOptions,
  ): Promise<OvertrainingAnalysis> {
    const now = options.now ?? new Date();
    const calculator = options.config
      ? new OvertrainingCalculator(options.config)
      : this.calculator;
    const config = calculator.getConfig();

    const lookbackMs =
      (config.volumeWindowDays + config.baselineWindowDays) * 86_400_000;

    const sessions = await this.loadSessions(
      userId,
      new Date(now.getTime() - lookbackMs),
      now,
    );

    return calculator.calculate({ sessions, now }, now);
  }
}

export const overtrainingService = new OvertrainingService();