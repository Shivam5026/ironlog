import { CheckCircle2, Circle } from "lucide-react";

interface ExerciseCompletedIndicatorProps {
  completed: boolean;
}

export function ExerciseCompletedIndicator({ completed }: ExerciseCompletedIndicatorProps) {
  return completed ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Completed" />
  ) : (
    <Circle className="h-5 w-5 text-muted-foreground" aria-label="Not completed" />
  );
}
