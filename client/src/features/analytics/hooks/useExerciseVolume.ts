import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { exerciseQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

export function useExerciseVolume(range: AnalyticsRange = "all") {
  return useQuery({
    queryKey: ["analytics", "exercise-volume", range],
    queryFn: () => analyticsApi.getExerciseVolume(range),
    ...exerciseQueryOptions,
  });
}
