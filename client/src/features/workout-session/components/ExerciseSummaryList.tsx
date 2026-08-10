import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import type { WorkoutSummaryExercise } from "../types/workout-summary";

interface ExerciseSummaryListProps {
  exercises: WorkoutSummaryExercise[];
}

export function ExerciseSummaryList({ exercises }: ExerciseSummaryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Exercises</CardTitle>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exercises logged.</p>
        ) : (
          <ul className="divide-y">
            {exercises.map((exercise) => (
              <li
                key={exercise.exerciseId}
                className="flex items-center justify-between gap-2 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{exercise.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.completedSets} sets · {Math.round(exercise.totalVolume)} kg volume
                  </p>
                </div>
                <p className="shrink-0 text-sm tabular-nums">
                  {exercise.bestWeight} × {exercise.bestReps}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}