import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { trendsQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

export function useProgressTrends(range: AnalyticsRange = "all") {
  return useQuery({
    queryKey: ["analytics", "progress-trends", range],
    queryFn: () => analyticsApi.getProgressTrends(range),
    ...trendsQueryOptions,
  });
}
