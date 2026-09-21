import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import type { AnalyticsRange } from "../types/analytics.types";

export function useExerciseDistribution(range: AnalyticsRange = "all") {
  return useQuery({
    queryKey: ["analytics", "exercise-distribution", range],
    queryFn: () => analyticsApi.getExerciseDistribution(range),
  });
}
