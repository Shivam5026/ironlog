import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutSummaryApi } from "../api/workout-summary";

export function useWorkoutSummary(sessionId: string) {
  return useQuery({
    queryKey: [...queryKeys.workoutSessions, sessionId, "summary"],
    queryFn: () => workoutSummaryApi.getSummary(sessionId),
  });
}

export function useCompleteWorkout(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workoutSummaryApi.complete(sessionId),
    onSuccess: (summary) => {
      queryClient.setQueryData(
        [...queryKeys.workoutSessions, sessionId, "summary"],
        summary,
      );
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.workoutSessions, sessionId],
      });
    },
  });
}
