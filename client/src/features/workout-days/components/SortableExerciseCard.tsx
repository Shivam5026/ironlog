import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { WorkoutExerciseCard } from "./WorkoutExerciseCard";
import { ExerciseDragHandle } from "./ExerciseDragHandle";
import type { WorkoutPlanExercise } from "@/features/workout-exercises/types";

interface SortableExerciseCardProps {
  exercise: WorkoutPlanExercise;
  dayId: string;
  dayName: string;
}

export function SortableExerciseCard({ exercise, dayId, dayName }: SortableExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={isDragging ? "relative z-10" : undefined}
    >
      <WorkoutExerciseCard
        exercise={exercise}
        dayId={dayId}
        dayName={dayName}
        dragHandle={<ExerciseDragHandle {...listeners} isDragging={isDragging} />}
        isDragging={isDragging}
      />
    </li>
  );
}
