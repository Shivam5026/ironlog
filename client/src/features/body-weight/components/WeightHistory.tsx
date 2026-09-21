import type { BodyWeightEntry } from "../types/body-weight.types";
import { WeightHistoryItem } from "./WeightHistoryItem";
import { WeightEmpty } from "./WeightEmpty";

interface WeightHistoryProps {
  items: BodyWeightEntry[];
  onEdit: (entry: BodyWeightEntry) => void;
  onDelete: (entry: BodyWeightEntry) => void;
}

export function WeightHistory({ items, onEdit, onDelete }: WeightHistoryProps) {
  if (items.length === 0) {
    return <WeightEmpty />;
  }

  return (
    <div className="rounded-xl border bg-card px-4">
      {items.map((entry) => (
        <WeightHistoryItem
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
