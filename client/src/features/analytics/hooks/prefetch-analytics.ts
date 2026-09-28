/**
 * Analytics Prefetch Utilities
 *
 * Prefetch analytics data when the user is likely to need them.
 * Call these from page-level components or route loaders.
 */

import { queryClient } from "@/shared/lib/query-client";
import { analyticsApi } from "../api/analytics";
import { volumeQueryOptions, frequencyQueryOptions, musclesQueryOptions, exerciseQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

/**
 * Prefetch all analytics shown on the Analytics Dashboard page.
 * Call when the user navigates to /analytics.
 */
export function prefetchAnalyticsDashboard(range: AnalyticsRange = "30d") {
  queryClient.prefetchQuery({
    queryKey: ["analytics", "volume", range],
    queryFn: () => analyticsApi.getVolumeAnalytics(range),
    ...volumeQueryOptions,
  });

  queryClient.prefetchQuery({
    queryKey: ["analytics", "frequency", range],
    queryFn: () => analyticsApi.getWorkoutFrequency(range),
    ...frequencyQueryOptions,
  });

  queryClient.prefetchQuery({
    queryKey: ["analytics", "exercise-distribution", range],
    queryFn: () => analyticsApi.getExerciseDistribution(range),
    ...exerciseQueryOptions,
  });

  queryClient.prefetchQuery({
    queryKey: ["analytics", "muscle-distribution", range],
    queryFn: () => analyticsApi.getMuscleDistribution(range),
    ...musclesQueryOptions,
  });
}

/**
 * Prefetch muscle analytics (frequency, balance, heatmap).
 * Call when the user navigates to the muscle analytics section.
 */
export function prefetchMuscleAnalytics(range: "weekly" | "monthly" = "weekly") {
  queryClient.prefetchQuery({
    queryKey: ["analytics", "muscle-heatmap", range],
    queryFn: () => analyticsApi.getMuscleHeatmap(range),
    ...musclesQueryOptions,
  });
}

/**
 * Prefetch exercise progress analytics.
 * Call when the user navigates to exercise progress.
 */
export function prefetchExerciseAnalytics(range: AnalyticsRange = "all") {
  queryClient.prefetchQuery({
    queryKey: ["analytics", "exercise-volume", range],
    queryFn: () => analyticsApi.getExerciseVolume(range),
    ...exerciseQueryOptions,
  });
}
