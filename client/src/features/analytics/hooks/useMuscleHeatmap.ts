import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { musclesQueryOptions } from "../config/analytics-query.config";
import type { MuscleFrequencyRange } from "../types/analytics.types";

export function useMuscleHeatmap(range: MuscleFrequencyRange = "weekly") {
  return useQuery({
    queryKey: ["analytics", "muscle-heatmap", range],
    queryFn: () => analyticsApi.getMuscleHeatmap(range),
    ...musclesQueryOptions,
  });
}
