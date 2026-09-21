import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import type { AnalyticsRange } from "../types/analytics.types";

export function useMuscleDistribution(range: AnalyticsRange = "all") {
  return useQuery({
    queryKey: ["analytics", "muscle-distribution", range],
    queryFn: () => analyticsApi.getMuscleDistribution(range),
  });
}
