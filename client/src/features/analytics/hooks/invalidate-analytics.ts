/**
 * Analytics Query Invalidation
 *
 * Centralized invalidation for analytics-related TanStack queries.
 * Call these from mutation hooks/side-effects to keep the UI in sync.
 *
 * Strategy:
 * - Workout completed → invalidate all analytics (volume, trends, frequency, muscles, consistency, reports)
 * - Body weight changed → invalidate dashboard, trends, monthly report
 * - Narrow invalidation can be added later if profiling shows it's needed.
 */

import { queryClient } from "@/shared/lib/query-client";

/**
 * Invalidate all analytics queries after a workout is completed.
 */
export function invalidateWorkoutAnalytics() {
  return queryClient.invalidateQueries({ queryKey: ["analytics"] });
}

/**
 * Invalidate analytics queries affected by body weight changes.
 */
export function invalidateBodyWeightAnalytics() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics", "progress-trends"] }),
    queryClient.invalidateQueries({ queryKey: ["reports", "monthly"] }),
  ]);
}

/**
 * Invalidate analytics queries affected by personal record changes.
 */
export function invalidatePersonalRecordAnalytics() {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["analytics", "progress-trends"] }),
    queryClient.invalidateQueries({ queryKey: ["reports", "weekly"] }),
  ]);
}

/**
 * Invalidate the dashboard query specifically.
 */
export function invalidateDashboard() {
  return queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}
