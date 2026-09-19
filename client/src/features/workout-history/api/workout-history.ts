import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  WorkoutHistoryDetail,
  WorkoutHistoryFilters,
  WorkoutHistoryPage,
} from "../types/workout-history.types";

export interface WorkoutHistoryParams extends WorkoutHistoryFilters {
  cursor?: string;
  limit?: number;
}

export async function getWorkoutHistory(
  params: WorkoutHistoryParams = {},
): Promise<WorkoutHistoryPage> {
  const { data } = await api.get<ApiResponse<WorkoutHistoryPage>>(
    "/workout-history",
    {
      params: {
        limit: 10,
        ...params,
      },
    },
  );
  return data.data;
}

export async function getWorkoutDetails(
  sessionId: string,
): Promise<WorkoutHistoryDetail> {
  const { data } = await api.get<ApiResponse<WorkoutHistoryDetail>>(
    `/workout-history/${sessionId}`,
  );
  return data.data;
}