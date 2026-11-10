import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type { WorkoutSession } from "../types";

export const recoveryApi = {
  async getActiveSession() {
    const { data } = await api.get<ApiResponse<WorkoutSession | null>>(
      "/recovery/session/active",
    );
    return data.data;
  },

  async recoverSession(sessionId: string) {
    const { data } = await api.post<ApiResponse<WorkoutSession>>(
      `/recovery/session/${sessionId}`,
    );
    return data.data;
  },

  async clearRecoveredSession(sessionId: string) {
    const { data } = await api.delete<ApiResponse<WorkoutSession>>(
      `/recovery/session/${sessionId}`,
    );
    return data.data;
  },
};
