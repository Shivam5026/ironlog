import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { performanceApi } from "../api/performance";

export function usePreviousPerformance(exerciseId: string) {
  return useQuery({
    queryKey: [...queryKeys.performance, "exercise", exerciseId],
    queryFn: () => performanceApi.getPreviousPerformance(exerciseId),
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: [...queryKeys.performance, "personal-records"],
    queryFn: performanceApi.getPersonalRecords,
  });
}

export function useExerciseHistory(exerciseId: string, limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.performance, "history", exerciseId, limit],
    queryFn: () => performanceApi.getExerciseHistory(exerciseId, limit),
  });
}
