import type { RecoveryTrendsRange } from "../types/recovery.types";

/**
 * Centralized TanStack Query keys for the Recovery System (Feature 8.2).
 *
 * Every recovery query is keyed from this single object so the keys stay
 * consistent and targeted invalidation is trivial: invalidating
 * `recoveryKeys.all` refreshes the whole recovery family, while a specific
 * `recoveryKeys.trends("7d")` refreshes just one analytics range.
 *
 * The `range` parameter is part of the key for trends/reports because it
 * changes the response, so each range is cached separately.
 */
export const recoveryKeys = {
  all: ["recovery"] as const,

  summary: () => [...recoveryKeys.all, "summary"] as const,

  /**
   * The muscle recovery grid renders the same `GET /api/recovery` response as
   * the summary cards, so it intentionally resolves to the same cache entry.
   * This alias keeps the semantic name available without firing a duplicate
   * request when both are mounted together on the dashboard.
   */
  muscles: () => recoveryKeys.summary(),

  readiness: () => [...recoveryKeys.all, "readiness"] as const,
  recommendations: () => [...recoveryKeys.all, "recommendations"] as const,
  timeline: () => [...recoveryKeys.all, "timeline"] as const,

  analytics: () => [...recoveryKeys.all, "analytics"] as const,
  trends: (range: RecoveryTrendsRange) =>
    [...recoveryKeys.analytics(), "trends", range] as const,
  reports: (range: RecoveryTrendsRange) =>
    [...recoveryKeys.analytics(), "reports", range] as const,
};
