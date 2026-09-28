/**
 * Analytics Query Configuration
 *
 * Centralized staleTime, retry, and refetch settings for all
 * analytics and report queries. Different analytics have different
 * update characteristics, so staleTime values are tuned per category.
 */

import type { QueryMeta } from "@tanstack/react-query";

// ── Stale Times (ms) ──────────────────────────────────────────────

export const ANALYTICS_STALE_TIME = {
  /** Dashboard: frequently updated, 5 min stale */
  dashboard: 5 * 60 * 1000,

  /** Volume & frequency: moderate update rate, 5 min */
  volume: 5 * 60 * 1000,
  frequency: 5 * 60 * 1000,

  /** Trends & exercise data: less frequently updated, 10 min */
  trends: 10 * 60 * 1000,
  exercise: 10 * 60 * 1000,

  /** Muscle analytics: moderate, 10 min */
  muscles: 10 * 60 * 1000,

  /** Consistency: moderate, 5 min */
  consistency: 5 * 60 * 1000,

  /** Weekly report: stable for most of the week, 15 min */
  weeklyReport: 15 * 60 * 1000,

  /** Monthly report: very stable, 30 min */
  monthlyReport: 30 * 60 * 1000,
} as const;

// ── Retry Strategy ─────────────────────────────────────────────────

/**
 * Smart retry: retry transient failures (5xx, network) up to 2 times.
 * Don't retry client errors (4xx) — they won't succeed on retry.
 */
export function analyticsRetry(
  failureCount: number,
  error: Error & { status?: number },
): boolean {
  if (error.status !== undefined && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

// ── Base Query Options ─────────────────────────────────────────────

export const analyticsQueryOptions = {
  retry: analyticsRetry,
  refetchOnWindowFocus: true,
} as const;

// ── Per-Category Options ───────────────────────────────────────────

export const dashboardQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.dashboard,
} as const;

export const volumeQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.volume,
} as const;

export const frequencyQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.frequency,
} as const;

export const trendsQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.trends,
} as const;

export const exerciseQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.exercise,
} as const;

export const musclesQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.muscles,
} as const;

export const consistencyQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.consistency,
} as const;

export const weeklyReportQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.weeklyReport,
} as const;

export const monthlyReportQueryOptions = {
  ...analyticsQueryOptions,
  staleTime: ANALYTICS_STALE_TIME.monthlyReport,
} as const;
