import { useState } from "react";
import { Repeat } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { ExercisePickerDialog } from "@/features/workout-plans/components/ExercisePickerDialog";
import { ReplaceExerciseDialog } from "./ReplaceExerciseDialog";

interface ReplaceExerciseButtonProps {
  workoutDayId: string;
  workoutExerciseId: string;
  exerciseName: string;
}

export function ReplaceExerciseButton({
  workoutDayId,
  workoutExerciseId,
  exerciseName,
}: ReplaceExerciseButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Replace ${exerciseName}`}
        onClick={() => setDialogOpen(true)}
      >
        <Repeat className="size-3" />
      </Button>

      {dialogOpen && (
        <ReplaceExerciseDialog
          exerciseName={exerciseName}
          onConfirm={() => {
            setDialogOpen(false);
            setPickerOpen(true);
          }}
          onCancel={() => setDialogOpen(false)}
        />
      )}

      <ExercisePickerDialog
        workoutDayId={workoutDayId}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        mode="replace"
        replaceExerciseId={workoutExerciseId}
      />
    </>
  );
}
