import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  WorkoutDetail,
  WorkoutHistoryEntry,
  WorkoutHistoryFilters,
} from "../types/history";

export const historyApi = {
  async getHistory(filters: WorkoutHistoryFilters = {}) {
    const { data } = await api.get<ApiResponse<WorkoutHistoryEntry[]>>(
      "/history",
      { params: filters },
    );
    return data.data;
  },

  async getDetails(sessionId: string) {
    const { data } = await api.get<ApiResponse<WorkoutDetail>>(
      `/history/${sessionId}`,
    );
    return data.data;
  },

  async delete(sessionId: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/history/${sessionId}`,
    );
    return data.data;
  },
};
