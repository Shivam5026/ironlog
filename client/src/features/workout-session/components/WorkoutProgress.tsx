import { useWorkoutProgress } from "../hooks/useWorkoutProgress";
import type { WorkoutSession } from "../types";

interface WorkoutProgressProps {
  session: WorkoutSession;
}

export function WorkoutProgress({ session }: WorkoutProgressProps) {
  const { completedSets, totalSets, progressPercent } = useWorkoutProgress(session);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{completedSets}/{totalSets} sets</span>
        <span>{progressPercent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
