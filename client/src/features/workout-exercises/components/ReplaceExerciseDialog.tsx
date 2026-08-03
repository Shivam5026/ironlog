import { Repeat } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

interface ReplaceExerciseDialogProps {
  exerciseName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReplaceExerciseDialog({
  exerciseName,
  onConfirm,
  onCancel,
}: ReplaceExerciseDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold">Replace exercise?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {exerciseName} will be swapped for another exercise. Its sets, reps, rest
          time and notes stay unchanged.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={onConfirm}>
            <Repeat className="h-4 w-4" />
            Replace
          </Button>
        </div>
      </div>
    </div>
  );
}
