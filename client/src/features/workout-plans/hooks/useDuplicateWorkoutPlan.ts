import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutPlanApi } from "../api/workout-plans";

export function useDuplicateWorkoutPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workoutPlanApi.duplicatePlan(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Workout plan duplicated.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
