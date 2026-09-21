import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  AnalyticsRange,
  VolumeAnalyticsResponse,
  FrequencyAnalyticsResponse,
  ExerciseDistributionResponse,
  MuscleDistributionResponse,
} from "../types/analytics.types";

export const analyticsApi = {
  async getVolumeAnalytics(range: AnalyticsRange = "30d") {
    const { data } = await api.get<ApiResponse<VolumeAnalyticsResponse>>(
      "/analytics/volume",
      { params: { range } },
    );
    return data.data;
  },

  async getWorkoutFrequency(range: AnalyticsRange = "30d") {
    const { data } = await api.get<ApiResponse<FrequencyAnalyticsResponse>>(
      "/analytics/frequency",
      { params: { range } },
    );
    return data.data;
  },

  async getExerciseDistribution(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<ExerciseDistributionResponse>>(
      "/analytics/exercise-distribution",
      { params: { range } },
    );
    return data.data;
  },

  async getMuscleDistribution(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<MuscleDistributionResponse>>(
      "/analytics/muscle-distribution",
      { params: { range } },
    );
    return data.data;
  },
};
