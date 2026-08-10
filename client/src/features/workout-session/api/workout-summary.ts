import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { WorkoutSummary } from "../types/workout-summary";

export const workoutSummaryApi = {
  async getSummary(sessionId: string) {
    const { data } = await api.get<ApiResponse<WorkoutSummary>>(
      `/workout-sessions/${sessionId}/summary`,
    );
    return data.data;
  },

  async complete(sessionId: string) {
    const { data } = await api.post<ApiResponse<WorkoutSummary>>(
      `/workout-sessions/${sessionId}/complete`,
    );
    return data.data;
  },
};
