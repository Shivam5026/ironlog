import { useQuery } from "@tanstack/react-query";
import { getExercises } from "@/features/exercise/services/exercise.service";

export function useExerciseOptions() {
  return useQuery({
    queryKey: ["exercise-options"],
    queryFn: () => getExercises({ limit: 100 }),
  });
}
