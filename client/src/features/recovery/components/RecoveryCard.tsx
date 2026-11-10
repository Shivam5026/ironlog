import { Layers } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { useSelectedMuscleStore } from "../store/selected-muscle-store";
import {
  recoveryPercentageTone,
  recoveryStatusMeta,
  sortMusclesByRecovery,
} from "../utils/recovery-format";
import type { MuscleRecovery } from "../types/recovery.types";

interface RecoveryCardProps {
  muscles: MuscleRecovery[];
  averageRecovery: number;
  hasWorkoutHistory: boolean;
}

export function RecoveryCard({
  muscles,
  averageRecovery,
  hasWorkoutHistory,
}: RecoveryCardProps) {
  const selectedMuscle = useSelectedMuscleStore((state) => state.selectedMuscle);
  const selectMuscle = useSelectedMuscleStore((state) => state.selectMuscle);

  const trained = sortMusclesByRecovery(
    muscles.filter((muscle) => muscle.lastTrainedAt !== null),
  );
  const highlighted = trained.find((muscle) => muscle.muscle === selectedMuscle);
  const displayValue = highlighted?.recoveryPercentage ?? averageRecovery;
  const displayTone = recoveryPercentageTone(displayValue);

  return (
    <Card className="flex flex-col">
      <CardContent className="flex grow flex-col px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Layers className="size-4 text-primary" aria-hidden="true" />
          Muscle Recovery
        </div>

        <div className="mt-3">
          <p className="flex items-baseline gap-1.5 text-xl font-bold">
            <span>{displayValue}%</span>
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", displayTone)}
              style={{ width: `${displayValue}%` }}
              role="progressbar"
              aria-valuenow={displayValue}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={
                highlighted
                  ? `${highlighted.muscle} recovery`
                  : "Average muscle recovery"
              }
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {highlighted
              ? `${highlighted.muscle} · ${recoveryStatusMeta[highlighted.status].label}`
              : trained.length > 0
                ? `Across your ${trained.length} most recent muscle groups`
                : "Muscles you have trained"}
          </p>
        </div>

        {hasWorkoutHistory ? (
          <ul className="mt-4 max-h-44 grow space-y-1 overflow-y-auto pr-1">
            {trained.map((muscle) => {
              const { label, dot } = recoveryStatusMeta[muscle.status];
              const isSelected = muscle.muscle === selectedMuscle;
              return (
                <li key={muscle.muscle}>
                  <button
                    type="button"
                    onClick={() => selectMuscle(muscle.muscle)}
                    aria-pressed={isSelected}
                    aria-label={`${muscle.muscle}, ${label}, ${muscle.recoveryPercentage}% recovered`}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-accent text-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden="true" />
                    <span className="truncate">{muscle.muscle}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-muted-foreground">
                      {muscle.recoveryPercentage}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No workout history yet — recovery readings appear after your first
            completed workout.
          </p>
        )}
      </CardContent>
    </Card>
  );
}