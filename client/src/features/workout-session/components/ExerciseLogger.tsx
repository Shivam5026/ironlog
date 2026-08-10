import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { CompletedBadge } from "./CompletedBadge";
import { ExerciseNotes } from "./ExerciseNotes";
import { SetList } from "./SetList";
import { useCreateSet, useUpdateSet, useDeleteSet, useCompleteSet, useReorderSets } from "../hooks/useExerciseLogSets";
import { useUpdateExerciseLog } from "../hooks/useUpdateExerciseLog";
import type { ExerciseLog, WorkoutSessionSet } from "../types";

interface ExerciseLoggerProps {
  sessionId: string;
  log: ExerciseLog;
  onSetCompleted?: (set: WorkoutSessionSet) => void;
  onAllSetsCompleted?: () => void;
}

export function ExerciseLogger({
  sessionId,
  log,
  onSetCompleted,
  onAllSetsCompleted,
}: ExerciseLoggerProps) {
  const createSet = useCreateSet(sessionId);
  const updateSet = useUpdateSet(sessionId);
  const deleteSet = useDeleteSet(sessionId);
  const completeSet = useCompleteSet(sessionId);
  const reorderSets = useReorderSets(sessionId);
  const updateLog = useUpdateExerciseLog(sessionId);

  const sets = log.sets;
  const allCompleted = sets.length > 0 && sets.every((set) => set.completed);

  const pendingSetId =
    (createSet.isPending &&
      createSet.variables?.setNumber === sets.length &&
      "pending") ||
    (updateSet.variables && "setId" in updateSet.variables ? updateSet.variables.setId : null) ||
    (deleteSet.variables ? deleteSet.variables.setId : null) ||
    (completeSet.variables ? completeSet.variables.setId : null) ||
    null;

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    createSet.mutate({
      exerciseLogId: log.id,
      weight: 0,
      reps: lastSet?.reps ?? 10,
      setNumber: sets.length + 1,
      restTime: lastSet?.restTime ?? 90,
      setType: lastSet?.setType ?? "WORKING",
    });
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const orderedIds = sets.map((s) => s.id);
    const [moved] = orderedIds.splice(fromIndex, 1);
    orderedIds.splice(toIndex, 0, moved);

    reorderSets.mutate({ exerciseLogId: log.id, orderedIds });
  };

  const busy = createSet.isPending || updateSet.isPending || deleteSet.isPending || completeSet.isPending || reorderSets.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{log.exerciseName}</CardTitle>
        <CardAction>
          {allCompleted && <CompletedBadge completed />}
          <Badge variant="outline">{sets.length} sets</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {sets.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No sets yet.</p>
        ) : (
          <SetList
            sets={sets}
            pendingSetId={pendingSetId}
            onToggleComplete={(set) =>
              completeSet.mutate(
                { setId: set.id, completed: !set.completed },
                {
                  onSuccess: (updatedSet) => {
                    if (updatedSet.completed) onSetCompleted?.(updatedSet);
                    if (sets.every((s) => s.id === updatedSet.id || s.completed)) {
                      onAllSetsCompleted?.();
                    }
                  },
                },
              )
            }
            onDelete={(set) => deleteSet.mutate({ setId: set.id, exerciseLogId: log.id })}
            onMove={handleMove}
            onWeightCommit={(set, weight) => updateSet.mutate({ setId: set.id, payload: { weight } })}
            onRepsCommit={(set, reps) => updateSet.mutate({ setId: set.id, payload: { reps } })}
          />
        )}

        <Button variant="outline" onClick={handleAddSet} disabled={busy} className="w-full">
          {createSet.isPending ? <Loader2 className="animate-spin" /> : <Plus className="h-4 w-4" />}
          {createSet.isPending ? "Adding..." : "Add Set"}
        </Button>

        <ExerciseNotes
          notes={log.notes}
          disabled={updateLog.isPending}
          onSave={(value) => {
            updateLog.mutate({ logId: log.id, payload: { notes: value } });
          }}
        />

        {allCompleted && (
          <Button onClick={() => onAllSetsCompleted?.()} className="w-full">
            Exercise Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
