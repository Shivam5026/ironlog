import { WorkoutHistoryCard } from "./WorkoutHistoryCard";
import type { WorkoutHistoryEntry } from "../types/history";

interface WorkoutTimelineProps {
  entries: WorkoutHistoryEntry[];
}

export function WorkoutTimeline({ entries }: WorkoutTimelineProps) {
  const byMonth = new Map<string, WorkoutHistoryEntry[]>();

  for (const entry of entries) {
    const month = new Date(entry.startedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
    const bucket = byMonth.get(month) ?? [];
    bucket.push(entry);
    byMonth.set(month, bucket);
  }

  return (
    <div className="space-y-8">
      {[...byMonth.entries()].map(([month, items]) => (
        <section key={month}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {month} · {items.length} {items.length === 1 ? "workout" : "workouts"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entry) => (
              <WorkoutHistoryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
