import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getExercises } from "../services/exercise.service";
import type { GetExercisesParams } from "../services/exercise.service";

export function useExercises(filters: GetExercisesParams) {
  const normalizedFilters: GetExercisesParams = {
    ...filters,

    search: filters.search?.trim(),

    bodyParts: filters.bodyParts?.trim(),

    targetMuscles: filters.targetMuscles?.trim(),

    equipments: filters.equipments?.trim(),
  };

  return useQuery({
    queryKey: ["exercises", normalizedFilters],

    queryFn: () => getExercises(normalizedFilters),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 10,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}