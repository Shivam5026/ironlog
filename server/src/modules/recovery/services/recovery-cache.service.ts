/**
 * Recovery Cache Service (Feature 1.2)
 *
 * Centralized Redis caching for the recovery engine. Reuses the shared
 * cache primitives in lib/cache — no second Redis client, no parallel cache
 * infrastructure. User-scoped keys prevent cross-user leakage.
 *
 * The recovery calculation remains the source of truth; this is purely an
 * optimization layer around it.
 */

import {
  getCacheWithAge,
  setCacheWithTimestamp,
  deleteCache,
  acquireCacheLock,
  releaseCacheLock,
  type CacheEntry,
} from "../../../lib/cache";
import type {
  DailyReadiness,
  RecoverySummary,
  RecoveryTimelineItem,
} from "../types/recovery.types";

// ── Key Prefixes ───────────────────────────────────────────────────

const KEYS = {
  RECOVERY_SUMMARY: "recovery:summary",
  RECOVERY_TIMELINE: "recovery:timeline",
  RECOVERY_READINESS: "recovery:readiness",
  RECOMMENDATION: "recommendation:today",
  REFRESH_LOCK: "recovery:refresh-lock",
} as const;

// ── TTL (seconds) ──────────────────────────────────────────────────

/** Configurable via RECOVERY_CACHE_TTL. Defaults to 5 minutes. */
const RECOVERY_CACHE_TTL = Number(process.env.RECOVERY_CACHE_TTL) || 300;

/**
 * Readiness cache TTL. Defaults to the recovery TTL (5 minutes) so the two
 * views stay in sync, and can be tuned independently via
 * RECOVERY_READINESS_CACHE_TTL.
 */
const RECOVERY_READINESS_CACHE_TTL =
  Number(process.env.RECOVERY_READINESS_CACHE_TTL) || RECOVERY_CACHE_TTL;

/**
 * Fraction of the TTL after which a cached value is still served but is
 * refreshed in the background. Defaults to 80% (4 minutes of a 5 minute TTL).
 */
const REFRESH_THRESHOLD_RATIO = Number(process.env.RECOVERY_REFRESH_THRESHOLD_RATIO) || 0.8;

/** How long a background refresh lock is held. */
const REFRESH_LOCK_TTL = 10;

// ── Key Builders ───────────────────────────────────────────────────

/** User-specific by design: a shared key would leak one user's recovery. */
export function recoverySummaryKey(userId: string): string {
  return `${KEYS.RECOVERY_SUMMARY}:${userId}`;
}

export function recoveryTimelineKey(userId: string): string {
  return `${KEYS.RECOVERY_TIMELINE}:${userId}`;
}

export function recoveryReadinessKey(userId: string): string {
  return `${KEYS.RECOVERY_READINESS}:${userId}`;
}

/**
 * Recommendation key (Feature 5.1). Defined here so every recovery-domain
 * cache key has a single home; recommendation.service re-exports it so
 * existing imports keep working.
 */
export function recommendationKey(userId: string): string {
  return `${KEYS.RECOMMENDATION}:${userId}`;
}

export function recoveryRefreshLockKey(userId: string): string {
  return `${KEYS.REFRESH_LOCK}:${userId}`;
}

// ── Configuration Accessors ────────────────────────────────────────

export function getRecoveryCacheTtl(): number {
  return RECOVERY_CACHE_TTL;
}

/** Readiness TTL (seconds); defaults to the recovery TTL. */
export function getRecoveryReadinessCacheTtl(): number {
  return RECOVERY_READINESS_CACHE_TTL;
}

/** Age (ms) past which a cached entry should be refreshed in the background. */
export function getRecoveryRefreshThresholdMs(): number {
  return RECOVERY_CACHE_TTL * 1000 * REFRESH_THRESHOLD_RATIO;
}

// ── Cache Backend ──────────────────────────────────────────────────

/**
 * Storage contract for the recovery cache. The production implementation is
 * Redis; keeping it behind an interface lets the service own cache policy
 * while remaining testable without a live Redis.
 */
export interface RecoveryCacheBackend {
  get(userId: string): Promise<CacheEntry<RecoverySummary> | null>;
  set(userId: string, summary: RecoverySummary): Promise<void>;
  getTimeline(userId: string): Promise<CacheEntry<RecoveryTimelineItem[]> | null>;
  setTimeline(userId: string, items: RecoveryTimelineItem[]): Promise<void>;
  tryAcquireRefreshLock(userId: string): Promise<boolean>;
  releaseRefreshLock(userId: string): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

/** Redis-backed implementation. Every method is failure-tolerant. */
export const redisRecoveryCacheBackend: RecoveryCacheBackend = {
  async get(userId) {
    return getCacheWithAge<RecoverySummary>(recoverySummaryKey(userId));
  },

  async set(userId, summary) {
    await setCacheWithTimestamp(recoverySummaryKey(userId), summary, RECOVERY_CACHE_TTL);
  },

  async getTimeline(userId) {
    return getCacheWithAge<RecoveryTimelineItem[]>(recoveryTimelineKey(userId));
  },

  async setTimeline(userId, items) {
    await setCacheWithTimestamp(recoveryTimelineKey(userId), items, RECOVERY_CACHE_TTL);
  },

  async tryAcquireRefreshLock(userId) {
    return acquireCacheLock(recoveryRefreshLockKey(userId), REFRESH_LOCK_TTL);
  },

  async releaseRefreshLock(userId) {
    await releaseCacheLock(recoveryRefreshLockKey(userId));
  },

  async invalidate(userId) {
    await deleteCache(recoverySummaryKey(userId));
    await deleteCache(recoveryTimelineKey(userId));
  },
};

// ── Readiness Cache Backend (Feature 8.1) ──────────────────────────

/**
 * Storage contract for the readiness cache. Kept separate from the recovery
 * backend so the two services own their own cache policy while sharing the
 * same key module, TTL constants, and invalidation entry point.
 */
export interface ReadinessCacheBackend {
  get(userId: string): Promise<CacheEntry<DailyReadiness> | null>;
  set(userId: string, readiness: DailyReadiness): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

/** Redis-backed readiness cache. Every method is failure-tolerant. */
export const redisReadinessCacheBackend: ReadinessCacheBackend = {
  async get(userId) {
    return getCacheWithAge<DailyReadiness>(recoveryReadinessKey(userId));
  },

  async set(userId, readiness) {
    await setCacheWithTimestamp(
      recoveryReadinessKey(userId),
      readiness,
      RECOVERY_READINESS_CACHE_TTL,
    );
  },

  async invalidate(userId) {
    await deleteCache(recoveryReadinessKey(userId));
  },
};

// ── Standalone Invalidation Entry Point ────────────────────────────

/**
 * Drops the cached recovery summary AND timeline for a single user.
 * Call this whenever data the recovery calculation depends on changes
 * (workout completion), so both views refresh together.
 */
export async function invalidateRecovery(userId: string): Promise<void> {
  await deleteCache(recoverySummaryKey(userId));
  await deleteCache(recoveryTimelineKey(userId));
}

/** Drops only the cached readiness score for a single user. */
export async function invalidateRecoveryReadiness(userId: string): Promise<void> {
  await redisReadinessCacheBackend.invalidate(userId);
}

/**
 * Every user-scoped cache key owned by the recovery domain. Exposed so tests
 * and callers can reason about which keys a workout completion must refresh.
 */
export function recoveryCacheKeys(userId: string) {
  return {
    summary: recoverySummaryKey(userId),
    timeline: recoveryTimelineKey(userId),
    readiness: recoveryReadinessKey(userId),
    recommendation: recommendationKey(userId),
  } as const;
}

/** Injectable cache invalidators so the combined entry point stays testable. */
export interface RecoveryCacheInvalidators {
  recovery: Pick<RecoveryCacheBackend, "invalidate">;
  readiness: Pick<ReadinessCacheBackend, "invalidate">;
  recommendation: { invalidate(userId: string): Promise<void> };
}

const redisRecommendationInvalidator: RecoveryCacheInvalidators["recommendation"] =
  {
    async invalidate(userId) {
      await deleteCache(recommendationKey(userId));
    },
  };

const defaultRecoveryCacheInvalidators: RecoveryCacheInvalidators = {
  recovery: redisRecoveryCacheBackend,
  readiness: redisReadinessCacheBackend,
  recommendation: redisRecommendationInvalidator,
};

/**
 * Drops every cached recovery-domain entry for a single user — summary,
 * timeline, readiness, and today's recommendation — so a freshly completed
 * workout never leaves a stale view behind. Call this from the workout
 * completion flow. Never throws: each backend invalidator is failure-tolerant.
 */
export async function invalidateRecoveryCache(
  userId: string,
  invalidators: RecoveryCacheInvalidators = defaultRecoveryCacheInvalidators,
): Promise<void> {
  await Promise.all([
    invalidators.recovery.invalidate(userId),
    invalidators.readiness.invalidate(userId),
    invalidators.recommendation.invalidate(userId),
  ]);
}
