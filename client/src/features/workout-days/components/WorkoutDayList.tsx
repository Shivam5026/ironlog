import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Dumbbell } from "lucide-react";

import { EmptyState } from "@/shared/components/ui/EmptyState";
import { SortableWorkoutDayCard } from "./SortableWorkoutDayCard";
import { useReorderWorkoutDays } from "../hooks/useReorderWorkoutDays";
import type { WorkoutDay } from "../types";

interface WorkoutDayListProps {
  days: WorkoutDay[];
  workoutPlanId: string;
  onRename: (day: WorkoutDay) => void;
  onDelete: (day: WorkoutDay) => void;
}

export function WorkoutDayList({ days, workoutPlanId, onRename, onDelete }: WorkoutDayListProps) {
  const reorderDays = useReorderWorkoutDays();
  const [localDays, setLocalDays] = useState<WorkoutDay[] | null>(null);

  // Reset local state when plan changes
  useEffect(() => {
    setLocalDays(null);
  }, [workoutPlanId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const displayed = localDays ?? days;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = displayed.findIndex((d) => d.id === active.id);
      const newIndex = displayed.findIndex((d) => d.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = [...displayed];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      setLocalDays(reordered);

      const payload = {
        workoutPlanId,
        days: reordered.map((d, i) => ({ id: d.id, order: i })),
      };
      reorderDays.mutate(payload, {
        onSuccess: () => setLocalDays(null),
        onError: () => setLocalDays(null),
      });
    },
    [displayed, workoutPlanId, reorderDays],
  );

  if (days.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workout days yet"
        description="Add a day to start building your routine."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={displayed.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="mx-auto max-w-2xl space-y-4">
          {displayed.map((day) => (
            <SortableWorkoutDayCard
              key={day.id}
              day={day}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
