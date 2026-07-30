import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutPlanApi } from "../api/workout-plans";
import type { UpdateWorkoutPlanPayload, WorkoutPlan } from "../types";

export function useUpdateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWorkoutPlanPayload }) =>
      workoutPlanApi.updatePlan(id, payload),

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.workoutPlans });
      const previous = queryClient.getQueryData<WorkoutPlan[]>(queryKeys.workoutPlans);

      queryClient.setQueryData<WorkoutPlan[]>(queryKeys.workoutPlans, (old) =>
        old?.map((p) => (p.id === id ? { ...p, ...payload } : p)),
      );

      return { previous };
    },

    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.workoutPlans, context.previous);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success("Workout plan updated.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
    },
  });
}
