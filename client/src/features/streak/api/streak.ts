import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { StreakSummary } from "../types/streak.types";

export const streakApi = {
  async getStreak() {
    const { data } = await api.get<ApiResponse<StreakSummary>>("/streak");
    return data.data;
  },
};
