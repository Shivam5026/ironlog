import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";

interface AddExerciseButtonProps {
  onClick: () => void;
}

export function AddExerciseButton({ onClick }: AddExerciseButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label="Add exercise"
    >
      <Plus className="size-3.5" />
      Add Exercise
    </Button>
  );
}
