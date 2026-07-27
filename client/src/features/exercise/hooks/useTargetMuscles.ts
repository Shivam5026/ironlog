import { useQuery } from "@tanstack/react-query";

import { getTargetMuscles } from "../services/exercise.service";

export function useTargetMuscles() {
  return useQuery({
    queryKey: ["target-muscles"],
    queryFn: getTargetMuscles,
    staleTime: Infinity,
  });
}