import { useCallback, useState } from "react";
import { SetCard } from "./SetCard";
import type { WorkoutSessionSet } from "../types";

interface SetListProps {
  sets: WorkoutSessionSet[];
  pendingSetId: string | null;
  onToggleComplete: (set: WorkoutSessionSet) => void;
  onDelete: (set: WorkoutSessionSet) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onWeightCommit: (set: WorkoutSessionSet, weight: number) => void;
  onRepsCommit: (set: WorkoutSessionSet, reps: number) => void;
}

export function SetList({
  sets,
  pendingSetId,
  onToggleComplete,
  onDelete,
  onMove,
  onWeightCommit,
  onRepsCommit,
}: SetListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = useCallback(() => {
    if (draggedIndex === null || overIndex === null || draggedIndex === overIndex) {
      setDraggedIndex(null);
      setOverIndex(null);
      return;
    }
    onMove(draggedIndex, overIndex);
    setDraggedIndex(null);
    setOverIndex(null);
  }, [draggedIndex, overIndex, onMove]);

  return (
    <div className="space-y-2">
      {sets.map((set, index) => (
        <div
          key={set.id}
          draggable
          onDragStart={() => setDraggedIndex(index)}
          onDragEnter={() => setOverIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onDragEnd={() => {
            setDraggedIndex(null);
            setOverIndex(null);
          }}
          className={
            draggedIndex === index
              ? "opacity-40"
              : overIndex === index && draggedIndex !== null
                ? "ring-2 ring-ring rounded-xl"
                : undefined
          }
        >
          <SetCard
            set={set}
            index={index}
            total={sets.length}
            canMoveUp={draggedIndex === null}
            canMoveDown={draggedIndex === null}
            isPending={pendingSetId === set.id}
            onToggleComplete={() => onToggleComplete(set)}
            onDelete={() => onDelete(set)}
            onMoveUp={() => onMove(index, index - 1)}
            onMoveDown={() => onMove(index, index + 1)}
            onWeightCommit={(weight) => onWeightCommit(set, weight)}
            onRepsCommit={(reps) => onRepsCommit(set, reps)}
          />
        </div>
      ))}
    </div>
  );
}
