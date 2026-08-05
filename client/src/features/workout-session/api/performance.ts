import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  ExerciseHistoryEntry,
  PersonalRecord,
  PreviousPerformance,
} from "../types";

export const performanceApi = {
  async getPreviousPerformance(exerciseId: string) {
    const { data } = await api.get<ApiResponse<PreviousPerformance | null>>(
      `/performance/exercise/${exerciseId}`,
    );
    return data.data;
  },

  async getPersonalRecords() {
    const { data } = await api.get<ApiResponse<PersonalRecord[]>>(
      "/performance/personal-records",
    );
    return data.data;
  },

  async getExerciseHistory(exerciseId: string, limit = 10) {
    const { data } = await api.get<ApiResponse<ExerciseHistoryEntry[]>>(
      `/performance/history/${exerciseId}`,
      { params: { limit } },
    );
    return data.data;
  },
};
