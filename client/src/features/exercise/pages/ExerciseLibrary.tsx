import SearchBar from "../components/SearchBar";
import SearchResults from "../components/ExerciseResults";
import FilterBar from "../components/FilterBar";
import FilterChip from "../components/FilterChip";
import Pagination from "../components/Pagination";

import { useDebounce } from "../hooks/useDebounce";
import { useExercises } from "../hooks/useExercises";
import { useBodyParts } from "../hooks/useBodyParts";
import { useTargetMuscles } from "../hooks/useTargetMuscles";
import { useEquipments } from "../hooks/useEquipments";
import { useExerciseFilters } from "../hooks/useExerciseFilters";
import { Spinner } from "@/shared/components/ui/Spinner";

export default function ExerciseLibrary() {
  const { filters, updateFilters, resetFilters, nextPage, previousPage } = useExerciseFilters();

  const bodyPartsQuery = useBodyParts();
  const targetMusclesQuery = useTargetMuscles();
  const equipmentsQuery = useEquipments();

  const debouncedSearch = useDebounce(filters.search, 300);

  const { data, isPending, isFetching, isError, error } = useExercises({
    ...filters,
    search: debouncedSearch,
  });

  const exercises = data?.data ?? [];
  const meta = data?.meta;
  const hasActiveFilters =
    Boolean(filters.bodyParts) || Boolean(filters.targetMuscles) || Boolean(filters.equipments);

  function handleFilterChange(field: keyof typeof filters, value: string) {
    updateFilters({
      [field]: value,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-4xl font-bold">Exercise Library</h1>

        <p className="mt-2 text-muted-foreground">
          Discover exercises, filter by muscle group, equipment and body part.
        </p>
      </header>

      <SearchBar value={filters.search} onChange={(value) => handleFilterChange("search", value)} />

      <FilterBar
        filters={filters}
        bodyParts={bodyPartsQuery.data ?? []}
        targetMuscles={targetMusclesQuery.data ?? []}
        equipments={equipmentsQuery.data ?? []}
        onChange={handleFilterChange}
        onReset={resetFilters}
      />

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.bodyParts && (
            <FilterChip
              label="Body"
              value={filters.bodyParts}
              onRemove={() => handleFilterChange("bodyParts", "")}
            />
          )}

          {filters.targetMuscles && (
            <FilterChip
              label="Muscle"
              value={filters.targetMuscles}
              onRemove={() => handleFilterChange("targetMuscles", "")}
            />
          )}

          {filters.equipments && (
            <FilterChip
              label="Equipment"
              value={filters.equipments}
              onRemove={() => handleFilterChange("equipments", "")}
            />
          )}
        </div>
      )}

      {isFetching && !isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <span>Updating exercises...</span>
        </div>
      )}

      <p className="text-sm text-muted-foreground">{meta?.total ?? 0} exercises found</p>

      <SearchResults exercises={exercises} isPending={isPending} isError={isError} error={error} />

      {(meta?.hasNextPage || meta?.hasPreviousPage) && (
        <Pagination
          hasNextPage={meta?.hasNextPage ?? false}
          hasPreviousPage={meta?.hasPreviousPage ?? false}
          isFetching={isFetching}
          onNext={() => nextPage(meta?.nextCursor)}
          onPrevious={() => previousPage(meta?.previousCursor)}
        />
      )}
    </div>
  );
}
