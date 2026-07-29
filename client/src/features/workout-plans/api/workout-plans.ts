import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { CreateWorkoutPlanPayload, WorkoutPlan } from "../types";

export const workoutPlanApi = {
  async createPlan(payload: CreateWorkoutPlanPayload) {
    const { data } = await api.post<ApiResponse<WorkoutPlan>>(
      "/workout-plans",
      payload,
    );
    return data.data;
  },

  async getPlans() {
    const { data } = await api.get<ApiResponse<WorkoutPlan[]>>(
      "/workout-plans",
    );
    return data.data;
  },
};
