import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/shared/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import {
  WORKOUT_HISTORY_SORTS,
  type WorkoutHistoryFilters,
  type WorkoutHistorySort,
} from "../types/workout-history.types";

const DEBOUNCE_MS = 300;

interface WorkoutHistoryFiltersProps {
  filters: WorkoutHistoryFilters;
  onChange: (filters: WorkoutHistoryFilters) => void;
  onReset: () => void;
}

export function WorkoutHistoryFilters({
  filters,
  onChange,
  onReset,
}: WorkoutHistoryFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? "");
  const [prevExternalSearch, setPrevExternalSearch] = useState(
    filters.search ?? "",
  );
  const externalSearch = filters.search ?? "";

  // Sync the local input when filters are reset/changed externally (Clear).
  if (prevExternalSearch !== externalSearch) {
    setPrevExternalSearch(externalSearch);
    setSearch(externalSearch);
  }

  const hasActiveFilters = Boolean(filters.search || filters.sort);

  useEffect(() => {
    const next = search.trim() || undefined;
    if (next === (filters.search || undefined)) return;

    const timeout = setTimeout(() => {
      onChange({ ...filters, search: next });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search, filters, onChange]);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workouts..."
          aria-label="Search workouts"
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.sort ?? "newest"}
          onValueChange={(sort) =>
            onChange({ ...filters, sort: sort as WorkoutHistorySort })
          }
        >
          <SelectTrigger className="w-fit min-w-[180px]" aria-label="Sort workouts">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {WORKOUT_HISTORY_SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Clear search and sort"
          >
            <X className="size-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}