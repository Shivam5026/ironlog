import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getExerciseById, searchExercises } from "../services/exercise.service";

interface UseSearchExercisesOptions {
  search: string;
  threshold?: number;
}

export function useSearchExercises({
  search,
  threshold = 0.5,
}: UseSearchExercisesOptions) {
  const normalizedSearch = search.trim().toLowerCase();

  return useQuery({
    queryKey: ["exercise-search", normalizedSearch, threshold],

    queryFn: () =>
      searchExercises({
        search: normalizedSearch,
        threshold,
      }),

    enabled: normalizedSearch.length >= 2,

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 10,

    placeholderData: keepPreviousData,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

export function useExercise(exerciseId: string) {
  return useQuery({
    queryKey: ["exercise", exerciseId],

    queryFn: () =>
      getExerciseById(exerciseId),

    enabled: !!exerciseId,

    staleTime: 1000 * 60 * 5,
  });
}