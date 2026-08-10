import { CheckCircle2, Circle, Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Separator } from "@/shared/components/ui/Separator";
import { cn } from "@/shared/lib/utils";

import type { WorkoutDetail } from "../types/history";

interface WorkoutDetailsCardProps {
  detail: WorkoutDetail;
}

export function WorkoutDetailsCard({ detail }: WorkoutDetailsCardProps) {
  return (
    <Card>
      <CardContent className="space-y-6">
        {detail.exercises.map((exercise, index) => {
          const completedSets = exercise.sets.filter((s) => s.completed).length;
          const allDone =
            exercise.sets.length > 0 && completedSets === exercise.sets.length;

          return (
            <div key={exercise.id}>
              {index > 0 && <Separator className="mb-6" />}

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{exercise.exerciseName}</h3>
                <Badge variant={allDone ? "default" : "secondary"}>
                  {completedSets}/{exercise.sets.length} sets
                </Badge>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {exercise.sets.map((set) => (
                  <div
                    key={set.setNumber}
                    className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm"
                  >
                    {set.completed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Set {set.setNumber}</span>
                    <span className={cn("ml-auto tabular-nums", !set.completed && "text-muted-foreground")}>
                      {set.weight} kg × {set.reps}
                    </span>
                  </div>
                ))}
              </div>

              {exercise.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <Dumbbell className="mr-1 inline size-3.5" />
                  {exercise.notes}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
