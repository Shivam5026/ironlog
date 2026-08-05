import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { exerciseLogApi } from "../api/exercise-log";
import type { UpdateExerciseLogPayload } from "../types";

export function useUpdateExerciseLog(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId, payload }: { logId: string; payload: UpdateExerciseLogPayload }) =>
      exerciseLogApi.updateLog(logId, payload),

    onSuccess: (updatedLog) => {
      queryClient.setQueryData(
        [...queryKeys.workoutSessions, sessionId],
        (session: unknown) => {
          if (!session || typeof session !== "object" || !("exerciseLogs" in session)) {
            return session;
          }

          const logs = (session as { exerciseLogs: unknown[] }).exerciseLogs.map((log) =>
            (log as { id: string }).id === updatedLog.id ? updatedLog : log,
          );

          return { ...(session as object), exerciseLogs: logs };
        },
      );
      toast.success("Exercise log saved.");
    },

    onError: (error) => toast.error(error.message),
  });
}
