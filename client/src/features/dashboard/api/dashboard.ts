import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  DashboardData,
  RecentPlan,
  RecentTemplate,
} from "../types/dashboard.types";

export const dashboardApi = {
  async getDashboard() {
    const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard");
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