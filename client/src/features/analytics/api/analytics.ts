import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  AnalyticsRange,
  VolumeAnalytics,
  FrequencyAnalyticsResponse,
  ExerciseDistributionResponse,
  MuscleDistributionResponse,
  ExerciseVolumeResponse,
  MuscleGroupVolumeResponse,
  ProgressTrends,
  ExerciseProgressMetricsResponse,
  VolumeComparisonResponse,
  OverloadDetectionResponse,
  PlateauDetectionResponse,
  MuscleFrequencyRange,
  MuscleFrequencyResponse,
  MuscleBalanceResponse,
  MuscleHeatmapResponse,
  ConsistencyRange,
  ConsistencyResponse,
} from "../types/analytics.types";

export const analyticsApi = {
  async getVolumeAnalytics(range: AnalyticsRange = "30d") {
    const { data } = await api.get<ApiResponse<VolumeAnalytics>>(
      "/analytics/volume",
      { params: { range } },
    );
    return data.data;
  },

  async getExerciseVolume(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<ExerciseVolumeResponse>>(
      "/analytics/volume/exercises",
      { params: { range } },
    );
    return data.data;
  },

  async getMuscleGroupVolume(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<MuscleGroupVolumeResponse>>(
      "/analytics/volume/muscles",
      { params: { range } },
    );
    return data.data;
  },

  async getProgressTrends(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<ProgressTrends>>(
      "/analytics/trends",
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

  async getExerciseProgressMetrics(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<ExerciseProgressMetricsResponse>>(
      "/analytics/trends/exercises",
      { params: { range } },
    );
    return data.data;
  },

  async getVolumeComparison(exerciseId: string, workoutSessionId: string) {
    const { data } = await api.get<ApiResponse<VolumeComparisonResponse>>(
      "/analytics/progressive-overload",
      { params: { exerciseId, workoutSessionId } },
    );
    return data.data;
  },

  async getOverloadDetection(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<OverloadDetectionResponse>>(
      "/analytics/progressive-overload/detection",
      { params: { range } },
    );
    return data.data;
  },

  async getPlateauDetection(range: AnalyticsRange = "all") {
    const { data } = await api.get<ApiResponse<PlateauDetectionResponse>>(
      "/analytics/progressive-overload/plateaus",
      { params: { range } },
    );
    return data.data;
  },

  async getMuscleFrequency(range: MuscleFrequencyRange = "weekly") {
    const { data } = await api.get<ApiResponse<MuscleFrequencyResponse>>(
      "/analytics/muscles",
      { params: { range, view: "frequency" } },
    );
    return data.data;
  },

  async getMuscleBalance(range: MuscleFrequencyRange = "weekly") {
    const { data } = await api.get<ApiResponse<MuscleBalanceResponse>>(
      "/analytics/muscles",
      { params: { range, view: "balance" } },
    );
    return data.data;
  },

  async getMuscleHeatmap(range: MuscleFrequencyRange = "weekly") {
    const { data } = await api.get<ApiResponse<MuscleHeatmapResponse>>(
      "/analytics/muscles",
      { params: { range, view: "heatmap" } },
    );
    return data.data;
  },

  async getConsistencyFrequency(range: ConsistencyRange = "weekly") {
    const { data } = await api.get<ApiResponse<ConsistencyResponse>>(
      "/analytics/consistency",
      { params: { range } },
    );
    return data.data;
  },
};
