import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutExerciseApi } from "../api/workout-exercises";

export function useDeleteWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      workoutExerciseApi.deleteWorkoutExercise(exerciseId),

    onSuccess: () => {
      // exercises render through WorkoutDay.exercises, so refresh the days + plans
      queryClient.invalidateQueries({ queryKey: ["workout-days"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Exercise removed from day.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
