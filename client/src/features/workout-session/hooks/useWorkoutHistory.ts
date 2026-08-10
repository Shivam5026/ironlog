import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { historyApi } from "../api/history";
import type { WorkoutHistoryFilters } from "../types/history";

export function useWorkoutHistory(filters: WorkoutHistoryFilters) {
  return useQuery({
    queryKey: [...queryKeys.history, filters],
    queryFn: () => historyApi.getHistory(filters),
  });
}
