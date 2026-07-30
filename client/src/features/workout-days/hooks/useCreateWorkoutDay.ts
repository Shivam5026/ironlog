import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutDayApi } from "../api/workout-days";
import type { CreateWorkoutDayPayload } from "../types";

export function useCreateWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkoutDayPayload) =>
      workoutDayApi.createWorkoutDay(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workout-days", variables.workoutPlanId],
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Workout day created.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
