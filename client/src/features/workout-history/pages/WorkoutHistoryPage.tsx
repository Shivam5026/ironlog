import { useState } from "react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { WorkoutHistoryFilters } from "../components/WorkoutHistoryFilters";
import { WorkoutHistoryList } from "../components/WorkoutHistoryList";
import { WorkoutHistoryEmpty } from "../components/WorkoutHistoryEmpty";
import type { WorkoutHistoryFilters as Filters } from "../types/workout-history.types";

const INITIAL_FILTERS: Filters = {};

function HistorySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i}>
          <CardContent className="py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-3.5" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function WorkoutHistoryPage() {
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useWorkoutHistory(filters);

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const handleLoadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Workout History</h1>
        <p className="text-sm text-muted-foreground">
          Your completed workouts, in one place.
        </p>
      </div>

      <WorkoutHistoryFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(INITIAL_FILTERS)}
      />

      {isPending ? (
        <HistorySkeleton />
      ) : isError ? (
        <ErrorState
          title="Failed to load history"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
        />
      ) : items.length === 0 ? (
        <WorkoutHistoryEmpty
          filtered={Boolean(filters.search || filters.sort)}
          onReset={() => setFilters(INITIAL_FILTERS)}
        />
      ) : (
        <WorkoutHistoryList
          items={items}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}