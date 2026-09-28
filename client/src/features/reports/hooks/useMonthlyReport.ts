import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "../api/reports.api";
import { monthlyReportQueryOptions } from "../../analytics/config/analytics-query.config";

export function useMonthlyReport(date?: string) {
  return useQuery({
    queryKey: ["reports", "monthly", date],
    queryFn: () => reportsApi.getMonthlyReport(date),
    ...monthlyReportQueryOptions,
  });
}
