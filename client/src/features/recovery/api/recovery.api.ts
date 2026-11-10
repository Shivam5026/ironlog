import { api } from "@/shared/lib/axios";
import type { ApiResponse } from "@/shared/types/ApiResponse";
import type {
  DailyReadiness,
  RecoveryReportsResponse,
  RecoverySummary,
  RecoveryTimelineItem,
  RecoveryTrendsRange,
  RecoveryTrendsResponse,
  TodayRecommendation,
} from "../types/recovery.types";

/**
 * Recovery Dashboard API (Feature 6.1).
 *
 * Reuses the existing Sprint 7 endpoints only:
 *   - GET /api/recovery            → overall muscle recovery summary
 *   - GET /api/recovery/readiness  → standalone readiness score (Feature 8.1)
 *   - GET /api/recovery/recommendations → today's recommendation (which also
 *     carries the current readiness score and level)
 *   - GET /api/recovery/timeline   → per-muscle recovery timeline (Feature 6.3)
 *   - GET /api/recovery/analytics/trends → recovery trends (Feature 7.1)
 *   - GET /api/recovery/analytics/reports → recovery reports (Feature 7.2)
 */
export const recoveryApi = {
  async getRecoverySummary(): Promise<RecoverySummary> {
    const { data } = await api.get<ApiResponse<RecoverySummary>>("/recovery");
    return data.data;
  },

  async getReadiness(): Promise<DailyReadiness> {
    const { data } = await api.get<ApiResponse<DailyReadiness>>(
      "/recovery/readiness",
    );
    return data.data;
  },

  async getTodayRecommendation(): Promise<TodayRecommendation> {
    const { data } = await api.get<ApiResponse<TodayRecommendation>>(
      "/recovery/recommendations",
    );
    return data.data;
  },

  async getRecoveryTimeline(): Promise<RecoveryTimelineItem[]> {
    const { data } = await api.get<ApiResponse<RecoveryTimelineItem[]>>(
      "/recovery/timeline",
    );
    return data.data;
  },

  async getRecoveryTrends(
    range: RecoveryTrendsRange,
  ): Promise<RecoveryTrendsResponse> {
    const { data } = await api.get<ApiResponse<RecoveryTrendsResponse>>(
      "/recovery/analytics/trends",
      { params: { range } },
    );
    return data.data;
  },

  async getRecoveryReports(
    range: RecoveryTrendsRange,
  ): Promise<RecoveryReportsResponse> {
    const { data } = await api.get<ApiResponse<RecoveryReportsResponse>>(
      "/recovery/analytics/reports",
      { params: { range } },
    );
    return data.data;
  },
};