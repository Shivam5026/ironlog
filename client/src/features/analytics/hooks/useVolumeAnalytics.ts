import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analytics";
import { volumeQueryOptions } from "../config/analytics-query.config";
import type { AnalyticsRange } from "../types/analytics.types";

export function useVolumeAnalytics(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: ["analytics", "volume", range],
    queryFn: () => analyticsApi.getVolumeAnalytics(range),
    ...volumeQueryOptions,
  });
}
