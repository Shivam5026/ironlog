import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { musclesQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

export function useMuscleGroupVolume(range: AnalyticsRange = "all") {
  return useQuery({
    queryKey: ["analytics", "muscle-group-volume", range],
    queryFn: () => analyticsApi.getMuscleGroupVolume(range),
    ...musclesQueryOptions,
  });
}
