import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutDayApi } from "../api/workout-days";

export function useDeleteWorkoutDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workoutDayApi.deleteWorkoutDay(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Workout day deleted.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
