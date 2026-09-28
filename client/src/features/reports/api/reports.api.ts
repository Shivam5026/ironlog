import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { WeeklyReport, MonthlyReport, ReportFormat } from "../types/report.types";

export const reportsApi = {
  async getWeeklyReport(date?: string) {
    const params = date ? { date } : {};
    const { data } = await api.get<ApiResponse<WeeklyReport>>(
      "/reports/weekly",
      { params },
    );
    return data.data;
  },

  async getMonthlyReport(date?: string) {
    const params = date ? { date } : {};
    const { data } = await api.get<ApiResponse<MonthlyReport>>(
      "/reports/monthly",
      { params },
    );
    return data.data;
  },

  async exportWeeklyReport(date?: string, format: ReportFormat = "csv") {
    const params: Record<string, string> = { format };
    if (date) params.date = date;
    const response = await api.get("/reports/weekly/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async exportMonthlyReport(date?: string, format: ReportFormat = "csv") {
    const params: Record<string, string> = { format };
    if (date) params.date = date;
    const response = await api.get("/reports/monthly/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
