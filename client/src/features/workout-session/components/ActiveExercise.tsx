import { SkipForward, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ExerciseLogger } from "./ExerciseLogger";
import { PreviousPerformanceCard } from "./PreviousPerformanceCard";
import type { ExerciseLog } from "../types";

interface ActiveExerciseProps {
  sessionId: string;
  log: ExerciseLog;
  isLast: boolean;
  isPending?: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onStartRest: (seconds: number) => void;
}

export function ActiveExercise({
  sessionId,
  log,
  isLast,
  isPending,
  onComplete,
  onSkip,
  onStartRest,
}: ActiveExerciseProps) {
  return (
    <div className="space-y-4">
      <ExerciseLogger
        sessionId={sessionId}
        log={log}
        onSetCompleted={onStartRest}
        onAllSetsCompleted={onComplete}
      />

      <PreviousPerformanceCard
        exerciseId={log.exerciseId}
        currentWeight={Number(log.sets[log.sets.length - 1]?.weight ?? 0)}
        currentReps={log.sets[log.sets.length - 1]?.reps ?? 0}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Rest starts when you complete a set.
        </p>
        <Button variant="outline" onClick={onSkip} disabled={isPending} size="sm">
          {isPending ? <Loader2 className="animate-spin" /> : <SkipForward className="h-4 w-4" />}
          {isLast ? "Finish" : "Skip"}
        </Button>
      </div>
    </div>
  );
}
