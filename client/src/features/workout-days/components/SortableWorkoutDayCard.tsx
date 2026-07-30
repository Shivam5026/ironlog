import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { WorkoutDayCard } from "./WorkoutDayCard";
import { DragHandle } from "./DragHandle";
import type { WorkoutDay } from "../types";

interface SortableWorkoutDayCardProps {
  day: WorkoutDay;
  onRename: (day: WorkoutDay) => void;
  onDelete: (day: WorkoutDay) => void;
}

export function SortableWorkoutDayCard({ day, onRename, onDelete }: SortableWorkoutDayCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: day.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <WorkoutDayCard
        day={day}
        onRename={onRename}
        onDelete={onDelete}
        dragHandle={<DragHandle {...listeners} isDragging={isDragging} />}
        isDragging={isDragging}
      />
    </div>
  );
}
