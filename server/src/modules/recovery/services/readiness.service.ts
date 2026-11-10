import { prisma } from "../../../config/prisma";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import type { CacheEntry } from "../../../lib/cache";
import type {
  DailyReadiness,
  ReadinessOptions,
} from "../types/recovery.types";
import {
  consecutiveTrainingDays,
  ReadinessCalculator,
} from "../utils/readiness.calculator";
import { RecoveryService } from "./recovery.service";
import {
  redisReadinessCacheBackend,
  type ReadinessCacheBackend,
} from "./recovery-cache.service";

const MS_PER_DAY = 86_400_000;

/**
 * Readiness Service (Feature 4.1)
 *
 * Computes the daily readiness score for the authenticated user by combining:
 *   - the muscle-recovery engine (Epic 3) for the muscle-recovery factor;
 *   - completed-session history from the analytics repository for the
 *     frequency, consecutive-training-days, and duration-trend factors.
 *
 * No new tables: everything is derived from existing Prisma models. The score
 * is deterministic for a fixed reference time and dataset, and missing or
 * incomplete duration data never breaks the calculation (it yields a neutral
 * factor instead).
 */
export class ReadinessService {
  constructor(
    private readonly recovery: RecoveryService = new RecoveryService(),
    private readonly repository: AnalyticsRepository = new AnalyticsRepository(
      prisma,
    ),
    private readonly calculator: ReadinessCalculator = new ReadinessCalculator(),
    private readonly cache: ReadinessCacheBackend = redisReadinessCacheBackend,
  ) {}

  /**
   * Returns the daily readiness score, served from Redis when cached (Feature
   * 8.1). Explicit reference times and config overrides bypass the cache so a
   * shared entry is never polluted — the recommendation engine's internal call
   * (which passes `now`) therefore always computes fresh.
   */
  async getDailyReadiness(
    userId: string,
    options: ReadinessOptions = {},
  ): Promise<DailyReadiness> {
    if (options.now || options.config) {
      return this.calculate(userId, options);
    }

    let cached: CacheEntry<DailyReadiness> | null = null;
    try {
      cached = await this.cache.get(userId);
    } catch (error) {
      // A failed cache read must never prevent the calculation.
      console.error("Readiness cache read failed", error);
    }

    if (cached) return cached.value;

    const readiness = await this.calculate(userId, options);
    try {
      await this.cache.set(userId, readiness);
    } catch (error) {
      // A failed cache write must never prevent the response.
      console.error("Readiness cache write failed", error);
    }
    return readiness;
  }

  private async calculate(
    userId: string,
    options: ReadinessOptions,
  ): Promise<DailyReadiness> {
    const now = options.now ?? new Date();
    const calculator = options.config
      ? new ReadinessCalculator(options.config)
      : this.calculator;
    const config = calculator.getConfig();

    // Always a fresh, deterministic read for readiness: passing `now` plus the
    // fatigue override routes the recovery call around the cached summary.
    const summary = await this.recovery.getRecoverySummary(userId, {
      now,
      fatigue: {
        config: {
          lookbackHours: config.muscleRecoveryLookbackDays * 24,
        },
      },
    });

    const recoveryPercentages = summary.muscles
      .filter((muscle) => muscle.lastTrainedAt !== null)
      .map((muscle) => muscle.recoveryPercentage);

    const recentStart = new Date(
      now.getTime() - config.frequencyWindowDays * MS_PER_DAY,
    );
    const baselineStart = new Date(
      now.getTime() - config.baselineWindowDays * MS_PER_DAY,
    );

    const sessionDates = (
      await this.repository.getCompletedSessionDates(userId, {
        startDate: baselineStart,
      })
    )
      .map((session) => session.endedAt)
      .filter((date): date is Date => date instanceof Date);

    const recentSessionCount = sessionDates.filter(
      (date) => date.getTime() >= recentStart.getTime(),
    ).length;
    const consecutiveTrainingDays$ = consecutiveTrainingDays(
      sessionDates,
      now,
      config.frequencyWindowDays,
    );

    const [recentDurations, baselineDurations] = await Promise.all([
      this.repository.getCompletedSessionDurations(userId, {
        startDate: recentStart,
      }),
      this.repository.getCompletedSessionDurations(userId, {
        startDate: baselineStart,
      }),
    ]);

    return calculator.calculate(
      {
        recoveryPercentages,
        recentSessionCount,
        consecutiveTrainingDays: consecutiveTrainingDays$,
        recentAvgDurationSeconds: averageDuration(recentDurations),
        baselineAvgDurationSeconds: averageDuration(baselineDurations),
      },
      now,
    );
  }
}

function averageDuration(
  sessions: Array<{ duration: number | null; [key: string]: unknown }>,
): number | null {
  const durations = sessions
    .map((session) => session.duration)
    .filter((duration): duration is number => duration !== null && duration > 0);
  if (durations.length === 0) return null;
  const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  return Math.round(mean);
}

export const readinessService = new ReadinessService();