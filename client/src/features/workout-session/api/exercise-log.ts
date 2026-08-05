import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  CreateExerciseLogPayload,
  ExerciseLog,
  UpdateExerciseLogPayload,
} from "../types";

export const exerciseLogApi = {
  async createLog(payload: CreateExerciseLogPayload) {
    const { data } = await api.post<ApiResponse<ExerciseLog>>(
      "/exercise-logs",
      payload,
    );
    return data.data;
  },

  async getLog(id: string) {
    const { data } = await api.get<ApiResponse<ExerciseLog>>(
      `/exercise-logs/${id}`,
    );
    return data.data;
  },

  async updateLog(id: string, payload: UpdateExerciseLogPayload) {
    const { data } = await api.put<ApiResponse<ExerciseLog>>(
      `/exercise-logs/${id}`,
      payload,
    );
    return data.data;
  },

  async deleteLog(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/exercise-logs/${id}`,
    );
    return data.data;
  },
};
