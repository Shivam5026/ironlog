import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  Repeat,
  Timer,
  Trophy,
} from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Separator } from "@/shared/components/ui/Separator";
import { cn } from "@/shared/lib/utils";
import { formatDuration } from "@/features/workout-session/utils/format";

import { formatWeight } from "../utils/format";
import type {
  WorkoutHistoryDetail,
  WorkoutHistorySet,
  WorkoutSetType,
} from "../types/workout-history.types";

const SET_TYPE_LABELS: Record<WorkoutSetType, string> = {
  WARMUP: "Warm-up",
  WORKING: "Working",
  FAILURE: "Failure",
};

function SetTypeBadge({ set }: { set: WorkoutHistorySet }) {
  if (set.setType === "WARMUP") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Flame className="size-3" />
        Warm-up
      </Badge>
    );
  }
  if (set.setType === "FAILURE" || set.isFailure) {
    return (
      <Badge variant="destructive" className="gap-1">
        <Flame className="size-3" />
        Failure
      </Badge>
    );
  }
  return <Badge variant="outline">{SET_TYPE_LABELS.WORKING}</Badge>;
}

function SetRow({ set }: { set: WorkoutHistorySet }) {
  const meta = [
    set.rpe !== null ? `RPE ${set.rpe}` : null,
    set.rir !== null ? `RIR ${set.rir}` : null,
    set.tempo ? `Tempo ${set.tempo}` : null,
    set.restTime > 0 ? `Rest ${formatDuration(set.restTime)}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        {set.completed ? (
          <CheckCircle2 className="size-4 shrink-0 text-primary" />
        ) : (
          <Circle className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-muted-foreground">Set {set.setNumber}</span>
        <SetTypeBadge set={set} />
        <span
          className={cn(
            "ml-auto tabular-nums font-medium",
            !set.completed && "text-muted-foreground",
          )}
        >
          {formatWeight(set.weight)} kg × {set.reps}
        </span>
      </div>

      {meta.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs text-muted-foreground">
          {meta.map((entry) => (
            <span key={entry} className="flex items-center gap-1">
              {entry.startsWith("Rest") ? (
                <Timer className="size-3" />
              ) : entry.startsWith("Tempo") ? (
                <Repeat className="size-3" />
              ) : null}
              {entry}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkoutHistoryDetails({
  detail,
}: {
  detail: WorkoutHistoryDetail;
}) {
  return (
    <div className="space-y-6">
      {detail.personalRecords.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-amber-500" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {detail.personalRecords.map((record) => (
              <div
                key={record.exerciseId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <div>
                  <p className="font-medium">{record.exerciseName}</p>
                  <p className="text-xs text-muted-foreground">
                    Previous best: {formatWeight(record.previousBestWeight)} ×{" "}
                    {record.previousBestReps}
                  </p>
                </div>
                <p className="tabular-nums font-semibold text-amber-600">
                  {formatWeight(record.weight)} × {record.reps}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
                  <h3 className="flex items-center gap-2 font-medium">
                    <span className="text-muted-foreground">
                      {exercise.exerciseOrder}
                    </span>
                    {exercise.exerciseName}
                  </h3>
                  <Badge variant={allDone ? "default" : "secondary"}>
                    {completedSets}/{exercise.sets.length} sets
                  </Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {exercise.sets.map((set) => (
                    <SetRow key={set.setNumber} set={set} />
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
    </div>
  );
}