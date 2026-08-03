import type { WorkoutDay } from "../types";

interface WorkoutDayOverlayProps {
  day: WorkoutDay;
}

export function WorkoutDayOverlay({ day }: WorkoutDayOverlayProps) {
  const exerciseCount = (day.exercises ?? []).length;

  return (
    <div className="rounded-lg border bg-card p-4 shadow-lg ring-1 ring-border">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-lg font-medium capitalize">{day.name}</p>
        <span className="shrink-0 text-xs text-muted-foreground">
          {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"}
        </span>
      </div>
    </div>
  );
}
