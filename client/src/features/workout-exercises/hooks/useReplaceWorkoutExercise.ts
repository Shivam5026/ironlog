import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutExerciseApi } from "../api/workout-exercises";
import type { ReplaceWorkoutExercisePayload } from "../types";

export function useReplaceWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workoutExerciseId,
      ...payload
    }: { workoutExerciseId: string } & ReplaceWorkoutExercisePayload) =>
      workoutExerciseApi.replaceWorkoutExercise(workoutExerciseId, payload),

    onSuccess: () => {
      // exercises render through WorkoutDay.exercises, so refresh the days + plans
      queryClient.invalidateQueries({ queryKey: ["workout-days"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Exercise replaced.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
