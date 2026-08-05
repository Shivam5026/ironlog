import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { exerciseLogApi } from "../api/exercise-log";
import type { CreateExerciseLogPayload } from "../types";

export function useCreateExerciseLog(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExerciseLogPayload) => exerciseLogApi.createLog(payload),

    onSuccess: (createdLog) => {
      queryClient.setQueryData(
        [...queryKeys.workoutSessions, sessionId],
        (session: unknown) => {
          if (!session || typeof session !== "object" || !("exerciseLogs" in session)) {
            return session;
          }

          const logs = [...(session as { exerciseLogs: unknown[] }).exerciseLogs, createdLog];

          return { ...(session as object), exerciseLogs: logs };
        },
      );
      toast.success("Exercise added.");
    },

    onError: (error) => toast.error(error.message),
  });
}
