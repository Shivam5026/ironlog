import { useQuery } from "@tanstack/react-query";

import { getBodyParts } from "../services/exercise.service";

export function useBodyParts() {
  return useQuery({
    queryKey: ["body-parts"],
    queryFn: getBodyParts,
    staleTime: Infinity,
  });
}