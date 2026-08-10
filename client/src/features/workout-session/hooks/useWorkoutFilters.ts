import { useSearchParams } from "react-router-dom";
import type { WorkoutHistoryFilters } from "../types/history";

export function useWorkoutFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: WorkoutHistoryFilters = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    exercise: searchParams.get("exercise") ?? undefined,
    plan: searchParams.get("plan") ?? undefined,
  };

  function updateFilters(updates: Partial<WorkoutHistoryFilters>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    setSearchParams(params);
  }

  function resetFilters() {
    setSearchParams({});
  }

  return { filters, updateFilters, resetFilters };
}
