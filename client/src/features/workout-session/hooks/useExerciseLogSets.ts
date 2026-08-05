import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { exerciseLogSetApi } from "../api/exercise-log-set";
import type { CreateExerciseLogSetPayload, UpdateExerciseLogSetPayload, WorkoutSessionSet } from "../types";
import { addSetToSession, patchSetInSession, removeSetFromSession, replaceSetsInSession } from "./set-cache";

export function useCreateSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExerciseLogSetPayload) => exerciseLogSetApi.createSet(payload),
    onSuccess: (set: WorkoutSessionSet) => {
      addSetToSession(queryClient, sessionId, set);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, payload }: { setId: string; payload: UpdateExerciseLogSetPayload }) =>
      exerciseLogSetApi.updateSet(setId, payload),
    onSuccess: (set: WorkoutSessionSet) => {
      patchSetInSession(queryClient, sessionId, set);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, exerciseLogId }: { setId: string; exerciseLogId: string }) =>
      exerciseLogSetApi.deleteSet(setId).then(() => ({ setId, exerciseLogId })),
    onSuccess: ({ setId, exerciseLogId }) => {
      removeSetFromSession(queryClient, sessionId, exerciseLogId, setId);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCompleteSet(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, completed }: { setId: string; completed?: boolean }) =>
      exerciseLogSetApi.completeSet(setId, completed),
    onSuccess: (set: WorkoutSessionSet) => {
      patchSetInSession(queryClient, sessionId, set);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useReorderSets(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exerciseLogId, orderedIds }: { exerciseLogId: string; orderedIds: string[] }) =>
      exerciseLogSetApi.reorderSets(exerciseLogId, orderedIds),
    onSuccess: (sets: WorkoutSessionSet[], { exerciseLogId }) => {
      replaceSetsInSession(queryClient, sessionId, exerciseLogId, sets);
    },
    onError: (error) => toast.error(error.message),
  });
}
