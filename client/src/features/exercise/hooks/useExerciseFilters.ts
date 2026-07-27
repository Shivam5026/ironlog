import { useSearchParams } from "react-router-dom";
import type { ExerciseLibraryFilters } from "../types/exercise";


const DEFAULT_LIMIT = 20;

export function useExerciseFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: ExerciseLibraryFilters = {
    search: searchParams.get("search") ?? "",
    bodyParts: searchParams.get("bodyParts") ?? "",
    targetMuscles: searchParams.get("targetMuscles") ?? "",
    equipments: searchParams.get("equipments") ?? "",
    limit: Number(searchParams.get("limit") ?? DEFAULT_LIMIT),
    after: searchParams.get("after") ?? undefined,
    before: searchParams.get("before") ?? undefined,
  };

  function updateFilters(
    updates: Partial<ExerciseLibraryFilters>
  ) {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Whenever filters/search change, restart pagination.
    if (
      "search" in updates ||
      "bodyParts" in updates ||
      "targetMuscles" in updates ||
      "equipments" in updates
    ) {
      params.delete("after");
      params.delete("before");
    }

    setSearchParams(params);
  }

  function resetFilters() {
    setSearchParams({
      limit: DEFAULT_LIMIT.toString(),
    });
  }

  function nextPage(nextCursor?: string) {
    if (!nextCursor) return;

    const params = new URLSearchParams(searchParams);

    params.set("after", nextCursor);
    params.delete("before");

    setSearchParams(params);
  }

  function previousPage(previousCursor?: string) {
    if (!previousCursor) return;

    const params = new URLSearchParams(searchParams);

    params.set("before", previousCursor);
    params.delete("after");

    setSearchParams(params);
  }

  return {
    filters,

    updateFilters,

    resetFilters,

    nextPage,

    previousPage,
  };
}