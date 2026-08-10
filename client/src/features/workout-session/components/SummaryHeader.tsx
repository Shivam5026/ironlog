import type { WorkoutSummary } from "../types/workout-summary";
import { formatDuration } from "../utils/format";

interface SummaryHeaderProps {
  summary: WorkoutSummary;
}

export function SummaryHeader({ summary }: SummaryHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-3xl font-bold tracking-tight">Workout Summary</h1>
      <p className="text-sm text-muted-foreground">
        {new Date(summary.endedAt).toLocaleString()} ·{" "}
        {formatDuration(summary.duration)}
      </p>
    </div>
  );
}