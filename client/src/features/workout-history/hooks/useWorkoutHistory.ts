import { useInfiniteQuery } from "@tanstack/react-query";
import { getWorkoutHistory } from "../api/workout-history";
import type { WorkoutHistoryFilters } from "../types/workout-history.types";

function cleanFilters(filters: WorkoutHistoryFilters): WorkoutHistoryFilters {
  return {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.sort && filters.sort !== "newest" ? { sort: filters.sort } : {}),
  };
}

export function useWorkoutHistory(filters: WorkoutHistoryFilters) {
  return useInfiniteQuery({
    queryKey: ["workout-history", cleanFilters(filters)],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getWorkoutHistory({ ...filters, cursor: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });
}