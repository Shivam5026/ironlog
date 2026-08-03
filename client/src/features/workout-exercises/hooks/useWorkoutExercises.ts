import { useQuery } from "@tanstack/react-query";
import { workoutExerciseApi } from "../api/workout-exercises";

export function useWorkoutExercises(workoutDayId: string) {
  return useQuery({
    queryKey: ["workout-exercises", workoutDayId],
    queryFn: () => workoutExerciseApi.getWorkoutExercises(workoutDayId),
    enabled: !!workoutDayId,
    // keep fresh so the new exercise shows immediately (no 5-min default staleness)
    staleTime: 0,
  });
}
