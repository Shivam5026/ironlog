import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutExerciseApi } from "../api/workout-exercises";
import type { ReorderWorkoutExercisesPayload } from "../types";

export function useReorderWorkoutExercises() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReorderWorkoutExercisesPayload) =>
      workoutExerciseApi.reorderWorkoutExercises(payload),

    onSuccess: () => {
      // exercises render through WorkoutDay.exercises, so refresh the days + plans
      queryClient.invalidateQueries({ queryKey: ["workout-days"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
