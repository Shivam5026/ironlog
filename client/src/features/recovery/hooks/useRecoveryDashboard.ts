import {
  useRecoverySummary,
  useTodayRecommendation,
} from "../queries/use-recovery-queries";
import { deriveOverallFatigue } from "../utils/recovery-format";

/**
 * Combined Recovery Dashboard server state.
 *
 * Returns the two TanStack queries plus a couple of derived values computed
 * once so the four cards never repeat derivation work. Cards that share a
 * query key (summary vs recommendations) also share a single network request
 * thanks to TanStack Query's cache deduplication.
 */
export function useRecoveryDashboard() {
  const summary = useRecoverySummary();
  const recommendation = useTodayRecommendation();

  const muscles = summary.data?.muscles ?? [];
  const trained = muscles.filter((muscle) => muscle.lastTrainedAt !== null);

  return {
    summary,
    recommendation,
    overallFatigue: muscles.length > 0 ? deriveOverallFatigue(muscles) : null,
    trainedCount: trained.length,
    /** Average recovery across muscles the user has actually trained. */
    averageRecovery:
      trained.length > 0
        ? Math.round(
            trained.reduce((sum, m) => sum + m.recoveryPercentage, 0) /
              trained.length,
          )
        : 100,
    hasWorkoutHistory: trained.length > 0,
  };
}