import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutPlanApi } from "../api/workout-plans";
import type { CreateWorkoutPlanPayload } from "../types";

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkoutPlanPayload) =>
      workoutPlanApi.createPlan(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.workoutPlans,
      });
      toast.success("Workout plan created.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
