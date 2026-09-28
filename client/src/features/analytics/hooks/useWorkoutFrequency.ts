import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { frequencyQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

export function useWorkoutFrequency(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: ["analytics", "frequency", range],
    queryFn: () => analyticsApi.getWorkoutFrequency(range),
    ...frequencyQueryOptions,
  });
}
