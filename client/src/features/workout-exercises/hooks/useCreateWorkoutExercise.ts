import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutExerciseApi } from "../api/workout-exercises";
import type { CreateWorkoutExercisePayload } from "../types";

export function useCreateWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkoutExercisePayload) =>
      workoutExerciseApi.createWorkoutExercise(payload),

    onSuccess: () => {
      // exercises render through WorkoutDay.exercises, so refresh the days + plans
      queryClient.invalidateQueries({ queryKey: ["workout-days"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Exercise added to day.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
