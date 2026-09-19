import { Dumbbell } from "lucide-react";

import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";

interface WorkoutHistoryEmptyProps {
  filtered: boolean;
  onReset?: () => void;
}

export function WorkoutHistoryEmpty({
  filtered,
  onReset,
}: WorkoutHistoryEmptyProps) {
  return (
    <EmptyState
      icon={Dumbbell}
      title={filtered ? "No workouts match your filters" : "No workouts yet"}
      description={
        filtered
          ? "Try a different search term or clear your filters."
          : "Complete a workout and it will show up here."
      }
      action={
        filtered && onReset ? (
          <Button type="button" onClick={onReset} variant="outline">
            Clear filters
          </Button>
        ) : undefined
      }
    />
  );
}