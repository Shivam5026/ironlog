import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  WorkoutPlanExercise,
  CreateWorkoutExercisePayload,
  ReplaceWorkoutExercisePayload,
  UpdateWorkoutExercisePayload,
  ReorderWorkoutExercisesPayload,
} from "../types";

export const workoutExerciseApi = {
  async getWorkoutExercises(workoutDayId: string) {
    const { data } = await api.get<ApiResponse<WorkoutPlanExercise[]>>(
      "/workout-exercises",
      { params: { workoutDayId } },
    );
    return data.data;
  },

  async createWorkoutExercise(payload: CreateWorkoutExercisePayload) {
    const { data } = await api.post<ApiResponse<WorkoutPlanExercise>>(
      "/workout-exercises",
      payload,
    );
    return data.data;
  },

  async updateWorkoutExercise(exerciseId: string, payload: UpdateWorkoutExercisePayload) {
    const { data } = await api.put<ApiResponse<WorkoutPlanExercise>>(
      `/workout-exercises/${exerciseId}`,
      payload,
    );
    return data.data;
  },

  async replaceWorkoutExercise(exerciseId: string, payload: ReplaceWorkoutExercisePayload) {
    const { data } = await api.put<ApiResponse<WorkoutPlanExercise>>(
      `/workout-exercises/${exerciseId}/replace`,
      payload,
    );
    return data.data;
  },

  async reorderWorkoutExercises(payload: ReorderWorkoutExercisesPayload) {
    const { data } = await api.put<ApiResponse<null>>(
      "/workout-exercises/reorder",
      payload,
    );
    return data.data;
  },

  async deleteWorkoutExercise(exerciseId: string) {
    const { data } = await api.delete<ApiResponse<null>>(
      `/workout-exercises/${exerciseId}`,
    );
    return data.data;
  },
};
