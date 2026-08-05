import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { exerciseLogApi } from "../api/exercise-log";

export function useDeleteExerciseLog(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logId: string) => exerciseLogApi.deleteLog(logId),

    onSuccess: (_, logId) => {
      queryClient.setQueryData(
        [...queryKeys.workoutSessions, sessionId],
        (session: unknown) => {
          if (!session || typeof session !== "object" || !("exerciseLogs" in session)) {
            return session;
          }

          const logs = (session as { exerciseLogs: unknown[] }).exerciseLogs.filter(
            (log) => (log as { id: string }).id !== logId,
          );

          return { ...(session as object), exerciseLogs: logs };
        },
      );
      toast.success("Exercise removed.");
    },

    onError: (error) => toast.error(error.message),
  });
}
