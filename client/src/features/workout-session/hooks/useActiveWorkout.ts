import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutSessionApi } from "../api/workout-session";
import { showNewPersonalRecordToasts } from "../utils/personalRecords";
import { invalidateWorkoutAnalytics, invalidatePersonalRecordAnalytics } from "../../analytics/hooks/invalidate-analytics";

export function useActiveWorkout(sessionId: string) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: [...queryKeys.workoutSessions, sessionId],
    queryFn: () => workoutSessionApi.getById(sessionId),
  });

  const pause = useMutation({
    mutationFn: () => workoutSessionApi.pause(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData([...queryKeys.workoutSessions, sessionId], session);
      toast.success("Workout paused.");
    },
    onError: (error) => toast.error(error.message),
  });

  const resume = useMutation({
    mutationFn: () => workoutSessionApi.resume(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData([...queryKeys.workoutSessions, sessionId], session);
      toast.success("Workout resumed.");
    },
    onError: (error) => toast.error(error.message),
  });

  const finish = useMutation({
    mutationFn: () => workoutSessionApi.finish(sessionId),
    onSuccess: ({ session, newPRs }) => {
      queryClient.setQueryData([...queryKeys.workoutSessions, sessionId], session);
      queryClient.invalidateQueries({ queryKey: queryKeys.performance });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory });
      queryClient.invalidateQueries({ queryKey: queryKeys.streak });
      invalidateWorkoutAnalytics();

      if (newPRs.length > 0) {
        invalidatePersonalRecordAnalytics();
        showNewPersonalRecordToasts(newPRs);
      } else {
        toast.success("Workout finished.");
      }
    },
    onError: (error) => toast.error(error.message),
  });

  return { ...sessionQuery, pause, resume, finish };
}
