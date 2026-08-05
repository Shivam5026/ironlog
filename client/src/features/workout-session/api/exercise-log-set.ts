import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  CreateExerciseLogSetPayload,
  UpdateExerciseLogSetPayload,
  WorkoutSessionSet,
} from "../types";

export const exerciseLogSetApi = {
  async createSet(payload: CreateExerciseLogSetPayload) {
    const { data } = await api.post<ApiResponse<WorkoutSessionSet>>(
      "/exercise-log-sets",
      payload,
    );
    return data.data;
  },

  async updateSet(id: string, payload: UpdateExerciseLogSetPayload) {
    const { data } = await api.patch<ApiResponse<WorkoutSessionSet>>(
      `/exercise-log-sets/${id}`,
      payload,
    );
    return data.data;
  },

  async deleteSet(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/exercise-log-sets/${id}`,
    );
    return data.data;
  },

  async completeSet(id: string, completed = true) {
    const { data } = await api.patch<ApiResponse<WorkoutSessionSet>>(
      `/exercise-log-sets/${id}/complete`,
      { completed },
    );
    return data.data;
  },

  async reorderSets(exerciseLogId: string, orderedIds: string[]) {
    const { data } = await api.patch<ApiResponse<WorkoutSessionSet[]>>(
      "/exercise-log-sets/reorder",
      { exerciseLogId, orderedIds },
    );
    return data.data;
  },
};
