import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  CreateWorkoutPlanPayload,
  UpdateWorkoutPlanPayload,
  WorkoutPlan,
} from "../types";

export const workoutPlanApi = {
  async createPlan(payload: CreateWorkoutPlanPayload) {
    const { data } = await api.post<ApiResponse<WorkoutPlan>>(
      "/workout-plans",
      payload,
    );
    return data.data;
  },

  async updatePlan(id: string, payload: UpdateWorkoutPlanPayload) {
    const { data } = await api.put<ApiResponse<WorkoutPlan>>(
      `/workout-plans/${id}`,
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

  async getPlanById(id: string) {
    const { data } = await api.get<ApiResponse<WorkoutPlan>>(
      `/workout-plans/${id}`,
    );
    return data.data;
  },

  async duplicatePlan(id: string) {
    const { data } = await api.post<ApiResponse<WorkoutPlan>>(
      `/workout-plans/${id}/duplicate`,
    );
    return data.data;
  },

  async deletePlan(id: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/workout-plans/${id}`,
    );
    return data.data;
  },
};
