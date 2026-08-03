import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Dumbbell } from "lucide-react";

import { EmptyState } from "@/shared/components/ui/EmptyState";
import { SortableWorkoutDayCard } from "./SortableWorkoutDayCard";
import { WorkoutDayOverlay } from "./WorkoutDayOverlay";
import { useDndSensors } from "../dnd/sensors";
import { reorderItems } from "../dnd/helpers";
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
  const [activeDay, setActiveDay] = useState<WorkoutDay | null>(null);

  // Reset local state when plan changes
  useEffect(() => {
    setLocalDays(null);
  }, [workoutPlanId]);

  const sensors = useDndSensors();

  const displayed = localDays ?? days;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const day = displayed.find((d) => d.id === event.active.id);
      if (day) setActiveDay(day);
    },
    [displayed],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDay(null);

      const reordered = over ? reorderItems(displayed, String(active.id), String(over.id)) : null;
      if (!reordered) return;

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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDay(null)}
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

      <DragOverlay>
        {activeDay ? <WorkoutDayOverlay day={activeDay} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
