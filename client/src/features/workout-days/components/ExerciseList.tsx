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

import { SortableExerciseCard } from "./SortableExerciseCard";
import { ExerciseDragOverlay } from "./ExerciseDragOverlay";
import { useDndSensors } from "../dnd/sensors";
import { reorderItems } from "../dnd/helpers";
import { useReorderWorkoutExercises } from "@/features/workout-exercises/hooks/useReorderWorkoutExercises";
import type { WorkoutPlanExercise } from "@/features/workout-exercises/types";

interface ExerciseListProps {
  exercises: WorkoutPlanExercise[];
  dayId: string;
  dayName: string;
}

export function ExerciseList({ exercises, dayId, dayName }: ExerciseListProps) {
  const reorderExercises = useReorderWorkoutExercises();
  const [localExercises, setLocalExercises] = useState<WorkoutPlanExercise[] | null>(null);
  const [activeExercise, setActiveExercise] = useState<WorkoutPlanExercise | null>(null);

  // Reset local state when day changes
  useEffect(() => {
    setLocalExercises(null);
  }, [dayId]);

  const sensors = useDndSensors();

  const displayed = localExercises ?? exercises;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const exercise = displayed.find((e) => e.id === event.active.id);
      if (exercise) setActiveExercise(exercise);
    },
    [displayed],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveExercise(null);

      if (!over || active.id === over.id) {
        return;
      }

      const reordered = reorderItems(displayed, String(active.id), String(over.id));
      if (!reordered) return;

      setLocalExercises(reordered);

      const payload = {
        workoutDayId: dayId,
        exercises: reordered.map((e, i) => ({ id: e.id, order: i })),
      };
      reorderExercises.mutate(payload, {
        onSuccess: () => setLocalExercises(null),
        onError: () => setLocalExercises(null),
      });
    },
    [displayed, dayId, reorderExercises],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveExercise(null)}
    >
      <SortableContext
        items={displayed.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-2">
          {displayed.map((exercise) => (
            <SortableExerciseCard
              key={exercise.id}
              exercise={exercise}
              dayId={dayId}
              dayName={dayName}
            />
          ))}
        </ol>
      </SortableContext>

      <DragOverlay>
        {activeExercise ? <ExerciseDragOverlay exercise={activeExercise} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
