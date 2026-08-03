import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/shared/lib/queryKey";
import { workoutExerciseApi } from "../api/workout-exercises";
import type { UpdateWorkoutExercisePayload } from "../types";

export function useUpdateWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ exerciseId, ...payload }: { exerciseId: string } & UpdateWorkoutExercisePayload) =>
      workoutExerciseApi.updateWorkoutExercise(exerciseId, payload),

    onSuccess: () => {
      // exercises render through WorkoutDay.exercises, so refresh the days + plans
      queryClient.invalidateQueries({ queryKey: ["workout-days"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutPlans });
      toast.success("Exercise updated.");
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
