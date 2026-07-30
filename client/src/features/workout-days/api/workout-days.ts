import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  WorkoutDay,
  CreateWorkoutDayPayload,
  UpdateWorkoutDayPayload,
  ReorderWorkoutDaysPayload,
} from "../types";

export const workoutDayApi = {
  async getWorkoutDays(workoutPlanId: string) {
    const { data } = await api.get<ApiResponse<WorkoutDay[]>>(
      "/workout-days",
      { params: { workoutPlanId } },
    );
    return data.data;
  },

  async getWorkoutDay(id: string) {
    const { data } = await api.get<ApiResponse<WorkoutDay>>(
      `/workout-days/${id}`,
    );
    return data.data;
  },

  async createWorkoutDay(payload: CreateWorkoutDayPayload) {
    const { data } = await api.post<ApiResponse<WorkoutDay>>(
      "/workout-days",
      payload,
    );
    return data.data;
  },

  async updateWorkoutDay(id: string, payload: UpdateWorkoutDayPayload) {
    const { data } = await api.put<ApiResponse<WorkoutDay>>(
      `/workout-days/${id}`,
      payload,
    );
    return data.data;
  },

  async deleteWorkoutDay(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/workout-days/${id}`,
    );
    return data.data;
  },

  async reorderWorkoutDays(payload: ReorderWorkoutDaysPayload) {
    const { data } = await api.put<ApiResponse<null>>(
      "/workout-days/reorder",
      payload,
    );
    return data.data;
  },
};
