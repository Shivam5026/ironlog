import { History, Search } from "lucide-react";

import { EmptyState } from "@/shared/components/ui/EmptyState";

interface WorkoutHistoryEmptyProps {
  filtered: boolean;
}

export function WorkoutHistoryEmpty({ filtered }: WorkoutHistoryEmptyProps) {
  if (filtered) {
    return (
      <EmptyState
        icon={Search}
        title="No workouts match your filters"
        description="Try clearing your search or filters to see more workouts."
      />
    );
  }

  return (
    <EmptyState
      icon={History}
      title="No workouts yet"
      description="Complete your first workout and it will show up here."
    />
  );
}
