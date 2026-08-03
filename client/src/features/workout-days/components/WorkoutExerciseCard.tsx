import { useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/utils";

import { DeleteExerciseButton } from "@/features/workout-exercises/components/DeleteExerciseButton";
import { ReplaceExerciseButton } from "@/features/workout-exercises/components/ReplaceExerciseButton";
import { ExerciseSettingsDialog } from "@/features/workout-plans/components/ExerciseSettingsDialog";
import type { WorkoutPlanExercise } from "@/features/workout-exercises/types";

interface WorkoutExerciseCardProps {
  exercise: WorkoutPlanExercise;
  dayId: string;
  dayName: string;
  dragHandle?: ReactNode;
  isDragging?: boolean;
}

/**
 * One exercise row inside a day: configure (sets/reps/rest/notes),
 * replace, delete. Owns all per-exercise dialogs.
 */
export function WorkoutExerciseCard({
  exercise,
  dayId,
  dayName,
  dragHandle,
  isDragging,
}: WorkoutExerciseCardProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm",
        isDragging && "opacity-50",
      )}
    >
      <span className="flex min-w-0 items-center gap-1">
        {dragHandle}
        <span className="min-w-0">
          <span className="block truncate font-medium capitalize">{exercise.exerciseName}</span>
          {exercise.notes && (
            <span className="block truncate text-xs text-muted-foreground">{exercise.notes}</span>
          )}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="whitespace-nowrap text-muted-foreground">
          {exercise.sets}×{exercise.reps}
          {exercise.restTime ? ` · ${exercise.restTime}s rest` : ""}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Configure ${exercise.exerciseName}`}
          onClick={() => setSettingsOpen(true)}
        >
          <Pencil className="size-3" />
        </Button>
        <ReplaceExerciseButton
          workoutDayId={dayId}
          workoutExerciseId={exercise.id}
          exerciseName={exercise.exerciseName}
        />
        <DeleteExerciseButton
          exerciseId={exercise.id}
          exerciseName={exercise.exerciseName}
          dayName={dayName}
        />
      </span>

      {settingsOpen && (
        <ExerciseSettingsDialog
          exercise={exercise}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
