import { useQuery } from "@tanstack/react-query";

import { recoveryApi } from "../api/recovery.api";
import {
  recoveryReadinessQueryOptions,
  recoveryRecommendationsQueryOptions,
  recoveryReportsQueryOptions,
  recoverySummaryQueryOptions,
  recoveryTimelineQueryOptions,
  recoveryTrendsQueryOptions,
} from "../config/recovery-query.config";
import { buildRecoveryGridItems, buildTimelineGroups } from "../utils/muscle-group-map";
import type { RecoveryTrendsRange } from "../types/recovery.types";
import { recoveryKeys } from "./recovery-keys";

/**
 * Reusable Recovery System queries (Feature 8.2).
 *
 * Every recovery server-state read goes through these hooks so the query keys,
 * stale times, retry policy, and refetch behaviour live in one place. Server
 * data stays in TanStack Query — nothing here is mirrored into Zustand, which
 * is reserved for client-only preferences.
 */

/** Overall muscle recovery summary (also backs the six-group grid). */
export function useRecoverySummary() {
  return useQuery({
    queryKey: recoveryKeys.summary(),
    queryFn: recoveryApi.getRecoverySummary,
    ...recoverySummaryQueryOptions,
  });
}

/**
 * The six-group muscle recovery grid (Feature 6.2).
 *
 * Shares the summary cache entry (see `recoveryKeys.muscles`) so mounting it
 * alongside the summary cards never fires a duplicate request. The 11 backend
 * muscle readings are normalized into the six roadmap display groups.
 */
export function useRecoveryMuscles() {
  const query = useQuery({
    queryKey: recoveryKeys.muscles(),
    queryFn: recoveryApi.getRecoverySummary,
    ...recoverySummaryQueryOptions,
  });

  const items = query.data ? buildRecoveryGridItems(query.data.muscles) : [];

  return { ...query, items };
}

/** Standalone daily readiness score with its factor breakdown (Feature 8.1). */
export function useReadiness() {
  return useQuery({
    queryKey: recoveryKeys.readiness(),
    queryFn: recoveryApi.getReadiness,
    ...recoveryReadinessQueryOptions,
  });
}

/** Today's recommendation, which also carries the current readiness score. */
export function useTodayRecommendation() {
  return useQuery({
    queryKey: recoveryKeys.recommendations(),
    queryFn: recoveryApi.getTodayRecommendation,
    ...recoveryRecommendationsQueryOptions,
  });
}

/**
 * Recovery timeline (Feature 6.3). The 11 backend muscle entries are
 * normalized into the six roadmap display groups used across the dashboard.
 */
export function useRecoveryTimeline() {
  const query = useQuery({
    queryKey: recoveryKeys.timeline(),
    queryFn: recoveryApi.getRecoveryTimeline,
    ...recoveryTimelineQueryOptions,
  });

  const items = query.data ? buildTimelineGroups(query.data) : [];

  return { ...query, items };
}

/** Recovery trends for a selected range (Feature 7.1). */
export function useRecoveryTrends(range: RecoveryTrendsRange = "30d") {
  return useQuery({
    queryKey: recoveryKeys.trends(range),
    queryFn: () => recoveryApi.getRecoveryTrends(range),
    ...recoveryTrendsQueryOptions,
  });
}

/** Recovery reports for a selected range (Feature 7.2). */
export function useRecoveryReports(range: RecoveryTrendsRange = "30d") {
  return useQuery({
    queryKey: recoveryKeys.reports(range),
    queryFn: () => recoveryApi.getRecoveryReports(range),
    ...recoveryReportsQueryOptions,
  });
}
