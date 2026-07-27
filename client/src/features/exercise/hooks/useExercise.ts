import { useQuery } from "@tanstack/react-query";

import * as  exerciseService  from "../services/exercise.service";

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: () => exerciseService.getExerciseById(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}