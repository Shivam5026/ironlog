import { Search, RotateCcw } from "lucide-react";

import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";

import { useExerciseOptions } from "../hooks/useExerciseOptions";
import type { WorkoutHistoryFilters } from "../types/history";

interface WorkoutFilterBarProps {
  filters: WorkoutHistoryFilters;
  onSearch: (value: string) => void;
  onChange: (updates: Partial<WorkoutHistoryFilters>) => void;
  onReset: () => void;
}

export function WorkoutFilterBar({ filters, onSearch, onChange, onReset }: WorkoutFilterBarProps) {
  const { data: exerciseOptions } = useExerciseOptions();

  return (
    <Card className="grid gap-4 rounded-2xl border-border bg-muted/40 p-6 md:grid-cols-2 xl:grid-cols-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="history-search" className="text-sm font-medium text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="history-search"
            placeholder="Plan or exercise..."
            className="pl-8"
            value={filters.search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="history-exercise" className="text-sm font-medium text-muted-foreground">
          Exercise
        </label>
        <select
          id="history-exercise"
          value={filters.exercise ?? ""}
          onChange={(e) => onChange({ exercise: e.target.value })}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="">All exercises</option>
          {(exerciseOptions?.data ?? []).map((exercise) => (
            <option key={exercise.exerciseId} value={exercise.exerciseId}>
              {exercise.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="history-start" className="text-sm font-medium text-muted-foreground">
          From
        </label>
        <Input
          id="history-start"
          type="date"
          value={filters.startDate ?? ""}
          max={filters.endDate}
          onChange={(e) => onChange({ startDate: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="history-end" className="text-sm font-medium text-muted-foreground">
          To
        </label>
        <Input
          id="history-end"
          type="date"
          value={filters.endDate ?? ""}
          min={filters.startDate}
          onChange={(e) => onChange({ endDate: e.target.value })}
        />
      </div>

      <div className="md:col-span-2 xl:col-span-4">
        <Button type="button" variant="outline" onClick={onReset} disabled={!hasFilters(filters)}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </Card>
  );
}

function hasFilters(filters: WorkoutHistoryFilters): boolean {
  return Boolean(
    filters.search || filters.startDate || filters.endDate || filters.exercise,
  );
}
