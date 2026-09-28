import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports.api";
import { weeklyReportQueryOptions } from "../../analytics/config/analytics-query.config";

export function useWeeklyReport(date?: string) {
  return useQuery({
    queryKey: ["reports", "weekly", date],
    queryFn: () => reportsApi.getWeeklyReport(date),
    ...weeklyReportQueryOptions,
  });
}
