import type { WorkoutPlanExercise } from "@/features/workout-exercises/types";

interface ExerciseDragOverlayProps {
  exercise: WorkoutPlanExercise;
}

export function ExerciseDragOverlay({ exercise }: ExerciseDragOverlayProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-sm shadow-lg ring-1 ring-border">
      <span className="min-w-0 truncate font-medium capitalize">{exercise.exerciseName}</span>
      <span className="whitespace-nowrap text-muted-foreground">
        {exercise.sets}×{exercise.reps}
        {exercise.restTime ? ` · ${exercise.restTime}s rest` : ""}
      </span>
    </div>
  );
}
