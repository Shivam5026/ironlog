import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { useDeleteWorkoutExercise } from "../hooks/useDeleteWorkoutExercise";
import { DeleteWorkoutExerciseDialog } from "./DeleteWorkoutExerciseDialog";

interface DeleteExerciseButtonProps {
  exerciseId: string;
  exerciseName: string;
  dayName: string;
}

export function DeleteExerciseButton({
  exerciseId,
  exerciseName,
  dayName,
}: DeleteExerciseButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteExercise = useDeleteWorkoutExercise();

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove ${exerciseName}`}
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="size-3 text-destructive" />
      </Button>

      {confirmOpen && (
        <DeleteWorkoutExerciseDialog
          exerciseName={exerciseName}
          dayName={dayName}
          isPending={deleteExercise.isPending}
          onConfirm={() => {
            deleteExercise.mutate(exerciseId);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
