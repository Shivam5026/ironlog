import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

import { useUpdateWorkoutExercise } from "@/features/workout-exercises/hooks/useUpdateWorkoutExercise";
import { ExerciseConfigurationForm, type ExerciseConfigValues } from "./ExerciseConfigurationForm";

interface ExerciseSettingsDialogProps {
  exercise: {
    id: string;
    exerciseName: string;
    sets: number;
    reps: number;
    restTime: number;
    notes?: string | null;
  };
  onClose: () => void;
}

/**
 * Configure an exercise's sets/reps/rest/notes. Mirrors the delete/replace
 * confirmation modals (plain overlay) — consistent with the rest of the app.
 */
export function ExerciseSettingsDialog({ exercise, onClose }: ExerciseSettingsDialogProps) {
  const updateExercise = useUpdateWorkoutExercise();

  const [values, setValues] = useState<ExerciseConfigValues>({
    sets: exercise.sets,
    reps: exercise.reps,
    restTime: exercise.restTime,
    notes: exercise.notes ?? "",
  });

  const handleSave = async () => {
    await updateExercise.mutateAsync({
      exerciseId: exercise.id,
      sets: values.sets,
      reps: values.reps,
      restTime: values.restTime,
      notes: values.notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold capitalize">Configure {exercise.exerciseName}</h2>

        <div className="mt-4">
          <ExerciseConfigurationForm values={values} onChange={setValues} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={updateExercise.isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateExercise.isPending}>
            {updateExercise.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
