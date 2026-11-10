import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import {
  deleteCache,
  getCacheWithAge,
  setCacheWithTimestamp,
  type CacheEntry,
} from "../../../lib/cache";
import { FatigueService } from "./fatigue.service";
import { overtrainingService } from "./overtraining.service";
import { RecoveryCalculator } from "../utils/recovery.calculator";
import {
  buildWeekStarts,
  calculateRecoveryTrends,
  isTrendsRange,
  resolveTrendsConfig,
  TRENDS_RANGES,
} from "../utils/recovery-analytics.calculator";
import { calculateRecoveryReports } from "../utils/recovery-reports.calculator";
import type {
  MuscleFatigue,
  OvertrainingSession,
  RecoveryReportsOptions,
  RecoveryReportsResponse,
  RecoveryTrendsConfig,
  RecoveryTrendsOptions,
  RecoveryTrendsRange,
  RecoveryTrendsResponse,
} from "../types/recovery.types";

/**
 * Recovery Analytics Service (Feature 7.1, extended by Feature 7.2)
 *
 * Aggregates existing workout and recovery data into trend analytics and
 * recovery reports without reintroducing a database table:
 *
 * - Per-session data reuses OvertrainingService's normalization (volumes, set
 *   counts, and contribution-weighted per-muscle workload) — a single ranged
 *   repository query for the whole period.
 * - Fatigue and per-muscle workload reuse FatigueService's existing
 *   aggregation, computed only for weeks that contain at least one completed
 *   session (trends) or once over the whole period (reports).
 *
 * Results are cached per user and range in Redis using the shared cache
 * primitives, mirroring the recovery/overtraining caches, and are invalidated
 * wherever a completed workout changes the underlying data.
 */

// ── Cache Backend ──────────────────────────────────────────────────

/** Storage contract for recovery-trends cache entries. */
export interface RecoveryTrendsCacheBackend {
  get(
    userId: string,
    range: RecoveryTrendsRange,
  ): Promise<CacheEntry<RecoveryTrendsResponse> | null>;
  set(
    userId: string,
    range: RecoveryTrendsRange,
    trends: RecoveryTrendsResponse,
  ): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

export function recoveryTrendsKey(
  userId: string,
  range: RecoveryTrendsRange,
): string {
  return `recovery:trends:${userId}:${range}`;
}

function trendsTtl(): number {
  return (
    Number(process.env.RECOVERY_TRENDS_CACHE_TTL) ||
    Number(process.env.RECOVERY_CACHE_TTL) ||
    300
  );
}

/** Redis-backed implementation. Every method is failure-tolerant. */
export const redisRecoveryTrendsCacheBackend: RecoveryTrendsCacheBackend = {
  async get(userId, range) {
    return getCacheWithAge<RecoveryTrendsResponse>(
      recoveryTrendsKey(userId, range),
    );
  },

  async set(userId, range, trends) {
    await setCacheWithTimestamp(
      recoveryTrendsKey(userId, range),
      trends,
      trendsTtl(),
    );
  },

  async invalidate(userId) {
    for (const range of TRENDS_RANGES) {
      await deleteCache(recoveryTrendsKey(userId, range));
    }
  },
};

/**
 * Drops every cached trends range for a single user. Call this alongside the
 * other recovery invalidations so a workout completion never leaves stale
 * trend analytics behind.
 */
export async function invalidateRecoveryTrends(
  userId: string,
): Promise<void> {
  for (const range of TRENDS_RANGES) {
    await deleteCache(recoveryTrendsKey(userId, range));
  }
}

// ── Reports Cache Backend (Feature 7.2) ────────────────────────────

/** Storage contract for recovery-reports cache entries. */
export interface RecoveryReportsCacheBackend {
  get(
    userId: string,
    range: RecoveryTrendsRange,
  ): Promise<CacheEntry<RecoveryReportsResponse> | null>;
  set(
    userId: string,
    range: RecoveryTrendsRange,
    reports: RecoveryReportsResponse,
  ): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

export function recoveryReportsKey(
  userId: string,
  range: RecoveryTrendsRange,
): string {
  return `recovery:reports:${userId}:${range}`;
}

function reportsTtl(): number {
  return (
    Number(process.env.RECOVERY_REPORTS_CACHE_TTL) ||
    Number(process.env.RECOVERY_CACHE_TTL) ||
    300
  );
}

/** Redis-backed implementation. Every method is failure-tolerant. */
export const redisRecoveryReportsCacheBackend: RecoveryReportsCacheBackend = {
  async get(userId, range) {
    return getCacheWithAge<RecoveryReportsResponse>(
      recoveryReportsKey(userId, range),
    );
  },

  async set(userId, range, reports) {
    await setCacheWithTimestamp(
      recoveryReportsKey(userId, range),
      reports,
      reportsTtl(),
    );
  },

  async invalidate(userId) {
    for (const range of TRENDS_RANGES) {
      await deleteCache(recoveryReportsKey(userId, range));
    }
  },
};

/**
 * Drops every cached reports range for a single user. Like the trends
 * invalidation, this is called on workout completion so reports never serve a
 * stale fatigue/consistency picture.
 */
export async function invalidateRecoveryReports(
  userId: string,
): Promise<void> {
  for (const range of TRENDS_RANGES) {
    await deleteCache(recoveryReportsKey(userId, range));
  }
}

// ── Service ─────────────────────────────────────────────────────────

export interface RecoveryAnalyticsServiceDependencies {
  /** Loads and normalizes completed sessions. Inject for tests. */
  loadSessions?: (
    userId: string,
    since: Date,
    now: Date,
  ) => Promise<OvertrainingSession[]>;
  fatigue?: FatigueService;
  calculator?: RecoveryCalculator;
  config?: Partial<RecoveryTrendsConfig>;
  cache?: RecoveryTrendsCacheBackend;
  reportsCache?: RecoveryReportsCacheBackend;
}

export class RecoveryAnalyticsService {
  private readonly loadSessions: NonNullable<
    RecoveryAnalyticsServiceDependencies["loadSessions"]
  >;
  private readonly fatigue: FatigueService;
  private readonly calculator: RecoveryCalculator;
  private readonly config: RecoveryTrendsConfig;
  private readonly cache: RecoveryTrendsCacheBackend;
  private readonly reportsCache: RecoveryReportsCacheBackend;

  constructor(deps: RecoveryAnalyticsServiceDependencies = {}) {
    this.loadSessions =
      deps.loadSessions ??
      ((userId, since, now) =>
        overtrainingService.loadCompletedSessions(userId, since, now));
    this.fatigue = deps.fatigue ?? new FatigueService();
    this.calculator = deps.calculator ?? new RecoveryCalculator();
    this.config = resolveTrendsConfig(deps.config);
    this.cache = deps.cache ?? redisRecoveryTrendsCacheBackend;
    this.reportsCache = deps.reportsCache ?? redisRecoveryReportsCacheBackend;
  }

  /**
   * Returns the recovery trends for a period. Served from Redis when cached;
   * explicit reference times and config overrides recompute (and never share a
   * polluted cache entry), matching the recovery cache policy.
   */
  async getRecoveryTrends(
    userId: string,
    options: RecoveryTrendsOptions = {},
  ): Promise<RecoveryTrendsResponse> {
    const range = options.range ?? "30d";
    if (!isTrendsRange(range)) {
      throw new ApiError(
        400,
        `range must be one of ${TRENDS_RANGES.join(", ")}`,
      );
    }

    if (options.now || options.config) {
      return this.computeTrends(userId, range, options.now ?? new Date(), options.config);
    }

    let cached: CacheEntry<RecoveryTrendsResponse> | null = null;
    try {
      cached = await this.cache.get(userId, range);
    } catch (error) {
      console.error("Recovery trends cache read failed", error);
    }

    if (cached) return cached.value;

    const trends = await this.computeTrends(userId, range, new Date(), options.config);
    try {
      await this.cache.set(userId, range, trends);
    } catch (error) {
      console.error("Recovery trends cache write failed", error);
    }
    return trends;
  }

  /** Fresh, deterministic computation for a reference time. */
  private async computeTrends(
    userId: string,
    range: RecoveryTrendsRange,
    now: Date,
    configOverride?: Partial<RecoveryTrendsConfig>,
  ): Promise<RecoveryTrendsResponse> {
    const config = resolveTrendsConfig({
      ...this.config,
      ...configOverride,
    });

    const days = config.rangeDays[range];
    const rangeStart = new Date(now.getTime() - days * 86_400_000);

    // Single ranged aggregation for the whole period (reuses the overtraining
    // session normalization — no per-request recomputation of raw sets).
    const sessions = await this.loadSessions(userId, rangeStart, now);

    const weeklyFatigue = await this.computeWeeklyFatigue(
      userId,
      rangeStart,
      now,
      sessions,
      config,
    );

    return calculateRecoveryTrends({
      range,
      sessions,
      weeks: weeklyFatigue,
      now,
      recoveryHours: this.calculator.getConfig().recoveryHours,
      config,
    });
  }

  /**
   * Returns the recovery reports for a period. Served from Redis when cached;
   * explicit reference times and config overrides recompute (and never share a
   * polluted cache entry), matching the trends/recovery cache policy.
   */
  async getRecoveryReports(
    userId: string,
    options: RecoveryReportsOptions = {},
  ): Promise<RecoveryReportsResponse> {
    const range = options.range ?? "30d";
    if (!isTrendsRange(range)) {
      throw new ApiError(
        400,
        `range must be one of ${TRENDS_RANGES.join(", ")}`,
      );
    }

    if (options.now || options.config) {
      return this.computeReports(userId, range, options.now ?? new Date(), options.config);
    }

    let cached: CacheEntry<RecoveryReportsResponse> | null = null;
    try {
      cached = await this.reportsCache.get(userId, range);
    } catch (error) {
      console.error("Recovery reports cache read failed", error);
    }

    if (cached) return cached.value;

    const reports = await this.computeReports(userId, range, new Date(), options.config);
    try {
      await this.reportsCache.set(userId, range, reports);
    } catch (error) {
      console.error("Recovery reports cache write failed", error);
    }
    return reports;
  }

  /**
   * Fresh, deterministic report computation. One period scopes every section:
   * the same normalized sessions feed the recovery-time/consistency sections,
   * while fatigue and contribution-weighted balance reuse FatigueService over
   * the identical window.
   */
  private async computeReports(
    userId: string,
    range: RecoveryTrendsRange,
    now: Date,
    configOverride?: Partial<RecoveryTrendsConfig>,
  ): Promise<RecoveryReportsResponse> {
    const config = resolveTrendsConfig({
      ...this.config,
      ...configOverride,
    });

    const days = config.rangeDays[range];
    const rangeStart = new Date(now.getTime() - days * 86_400_000);

    const [sessions, fatigues, contributions] = await Promise.all([
      this.loadSessions(userId, rangeStart, now),
      this.fatigue.getMuscleFatigue(userId, { now, since: rangeStart }),
      this.fatigue.getMuscleContributions(userId, { now, since: rangeStart }),
    ]);

    return calculateRecoveryReports({
      range,
      sessions,
      fatigues,
      contributions,
      now,
      recoveryHours: this.calculator.getConfig().recoveryHours,
      config,
    });
  }

  /**
   * Fatigue snapshot per calendar week. Skips weeks with no completed session
   * (they report no fatigue) so empty ranges never trigger pointless queries;
   * the fatigue engine is otherwise reused verbatim with a week-scoped window.
   */
  private async computeWeeklyFatigue(
    userId: string,
    rangeStart: Date,
    now: Date,
    sessions: OvertrainingSession[],
    config: RecoveryTrendsConfig,
  ): Promise<{ weekStart: Date; fatigues: MuscleFatigue[] }[]> {
    const weekStarts = buildWeekStarts(rangeStart, now, config.weekStartDay);
    const weeks: { weekStart: Date; fatigues: MuscleFatigue[] }[] = [];

    for (let index = 0; index < weekStarts.length; index++) {
      const weekStart = weekStarts[index];
      const weekEnd =
        index < weekStarts.length - 1 ? weekStarts[index + 1] : now;

      const intervalStart = Math.max(weekStart.getTime(), rangeStart.getTime());
      const hasActivity = sessions.some(
        (session) =>
          session.endedAt.getTime() >= intervalStart &&
          session.endedAt.getTime() <= weekEnd.getTime(),
      );

      let fatigues: MuscleFatigue[] = [];
      if (hasActivity) {
        fatigues = await this.fatigue.getMuscleFatigue(userId, {
          now: weekEnd,
          since: new Date(intervalStart),
        });
      }

      weeks.push({ weekStart, fatigues });
    }

    return weeks;
  }
}

export const recoveryAnalyticsService = new RecoveryAnalyticsService();