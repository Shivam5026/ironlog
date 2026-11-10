/**
 * Recovery Dashboard Query Configuration (Feature 8.2)
 *
 * Centralized staleTime, retry, and refetch settings for every recovery query.
 * Recovery data changes only when a workout is completed, so the fast-moving
 * cards use a short stale time while the heavier analytics views tolerate a
 * longer one. The smart retry strategy mirrors the analytics feature: transient
 * failures retry, client errors do not.
 */

// ── Stale Times (ms) ───────────────────────────────────────────────

export const RECOVERY_STALE_TIME = {
  /** Summary, muscle grid, readiness and recommendation: 2 minutes. */
  summary: 2 * 60 * 1000,
  readiness: 2 * 60 * 1000,
  recommendations: 2 * 60 * 1000,

  /** Timeline and the range-based analytics views: 5 minutes. */
  timeline: 5 * 60 * 1000,
  trends: 5 * 60 * 1000,
  reports: 5 * 60 * 1000,
} as const;

// ── Retry Strategy ─────────────────────────────────────────────────

/**
 * Smart retry: retry transient failures (5xx, network) up to 2 times.
 * Don't retry client errors (4xx) — they won't succeed on retry.
 */
export function recoveryRetry(
  failureCount: number,
  error: Error & { status?: number },
): boolean {
  if (error.status !== undefined && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

// ── Base Query Options ─────────────────────────────────────────────

const recoveryBaseOptions = {
  retry: recoveryRetry,
  refetchOnWindowFocus: true,
} as const;

// ── Per-Category Options ───────────────────────────────────────────

export const recoverySummaryQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.summary,
} as const;

export const recoveryReadinessQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.readiness,
} as const;

export const recoveryRecommendationsQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.recommendations,
} as const;

export const recoveryTimelineQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.timeline,
} as const;

export const recoveryTrendsQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.trends,
} as const;

export const recoveryReportsQueryOptions = {
  ...recoveryBaseOptions,
  staleTime: RECOVERY_STALE_TIME.reports,
} as const;
