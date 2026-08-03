import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  DashboardStats,
  RecentPlan,
  RecentTemplate,
} from "../types";

export const dashboardApi = {
  async getStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>(
      "/dashboard/stats",
    );
    return data.data;
  },

  async getRecentPlans() {
    const { data } = await api.get<ApiResponse<RecentPlan[]>>(
      "/dashboard/recent-plans",
    );
    return data.data;
  },

  async getRecentTemplates() {
    const { data } = await api.get<ApiResponse<RecentTemplate[]>>(
      "/dashboard/recent-templates",
    );
    return data.data;
  },
};