import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { useWorkoutFilters } from "../hooks/useWorkoutFilters";
import { WorkoutFilterBar } from "../components/WorkoutFilterBar";
import { WorkoutTimeline } from "../components/WorkoutTimeline";
import { WorkoutHistoryEmpty } from "../components/WorkoutHistoryEmpty";
import type { WorkoutHistoryFilters } from "../types/history";

const DEBOUNCE_MS = 300;

export default function WorkoutHistoryPage() {
  const { filters, updateFilters, resetFilters } = useWorkoutFilters();
  const urlSearch = filters.search ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync local search state when URL filters change externally (back/forward nav).
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (search !== urlSearch) {
        updateFilters({ search });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search, urlSearch, updateFilters]);

  const { data: history, isPending, isError, error } = useWorkoutHistory(filters);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <p className="text-sm text-muted-foreground">Your completed workouts, in one place.</p>
      </div>

      <WorkoutFilterBar
        filters={filters}
        onSearch={setSearch}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {isPending ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load history"
          description={error instanceof Error ? error.message : "Something went wrong."}
        />
      ) : !history || history.length === 0 ? (
        <WorkoutHistoryEmpty filtered={hasActiveFilters(filters)} />
      ) : (
        <WorkoutTimeline entries={history} />
      )}
    </div>
  );
}

function hasActiveFilters(filters: WorkoutHistoryFilters): boolean {
  return Boolean(filters.search || filters.startDate || filters.endDate || filters.exercise);
}
