import { CheckCircle2, Circle } from "lucide-react";

interface CompletedBadgeProps {
  completed: boolean;
}

export function CompletedBadge({ completed }: CompletedBadgeProps) {
  return completed ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Completed" />
  ) : (
    <Circle className="h-5 w-5 text-muted-foreground" aria-label="Not completed" />
  );
}
