import { useWorkoutProgress } from "../hooks/useWorkoutProgress";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import type { WorkoutSession } from "../types";
import { formatDuration } from "../utils/format";

interface SessionStatisticsProps {
  session: WorkoutSession;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function SessionStatistics({ session }: SessionStatisticsProps) {
  const { totalSets, completedSets, totalReps, totalVolume } = useWorkoutProgress(session);
  const { elapsedSeconds } = useWorkoutTimer();

  const durationSeconds =
    session.status === "COMPLETED" && session.duration != null
      ? session.duration
      : elapsedSeconds;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Total sets" value={String(totalSets)} />
      <Stat label="Completed sets" value={String(completedSets)} />
      <Stat label="Total reps" value={String(totalReps)} />
      <Stat label="Total volume" value={`${Math.round(totalVolume)} kg`} />
      <Stat label="Duration" value={formatDuration(durationSeconds)} />
    </div>
  );
}
