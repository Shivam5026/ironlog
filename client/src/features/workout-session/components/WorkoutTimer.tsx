import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { useWorkoutTimer } from "../hooks/useWorkoutTimer";
import { formatDuration } from "../utils/format";

export function WorkoutTimer() {
  const { elapsedSeconds, isRunning, start, pause, resume, reset } = useWorkoutTimer();

  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xl font-semibold tabular-nums">
        {formatDuration(elapsedSeconds)}
      </span>
      <div className="flex gap-1">
        {isRunning ? (
          <Button variant="outline" size="icon-sm" onClick={pause} aria-label="Pause workout timer">
            <Pause className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="icon-sm" onClick={elapsedSeconds > 0 ? resume : start} aria-label="Start workout timer">
            <Play className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset workout timer">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
