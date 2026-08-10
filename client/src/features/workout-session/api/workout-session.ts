import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { WorkoutSession } from "../types";

export const workoutSessionApi = {
  async start(workoutPlanId: string, workoutDayId: string) {
    const { data } = await api.post<ApiResponse<WorkoutSession>>(
      "/workout-sessions/start",
      { workoutPlanId, workoutDayId },
    );
    return data.data;
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}`,
    );
    return data.data;
  },

  async pause(id: string) {
    const { data } = await api.put<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}/pause`,
    );
    return data.data;
  },

  async resume(id: string) {
    const { data } = await api.put<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}/resume`,
    );
    return data.data;
  },

  async finish(id: string) {
    const { data } = await api.post<ApiResponse<WorkoutSession>>(
      `/workout-sessions/${id}/finish`,
    );
    return data.data;
  },
};
