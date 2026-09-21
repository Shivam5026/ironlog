import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { relativeTime } from "@/shared/lib/relativeTime";
import { formatDate } from "../utils/format";
import type { BodyWeightEntry } from "../types/body-weight.types";

interface WeightHistoryItemProps {
  entry: BodyWeightEntry;
  onEdit: (entry: BodyWeightEntry) => void;
  onDelete: (entry: BodyWeightEntry) => void;
}

export function WeightHistoryItem({
  entry,
  onEdit,
  onDelete,
}: WeightHistoryItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="min-w-[120px] text-sm text-muted-foreground">
          {formatDate(entry.recordedAt)}
        </div>
        <div className="text-base font-medium">{entry.weight} kg</div>
        <div className="text-xs text-muted-foreground">
          {relativeTime(entry.recordedAt)}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(entry)}
          aria-label={`Edit weight entry from ${formatDate(entry.recordedAt)}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(entry)}
          aria-label={`Delete weight entry from ${formatDate(entry.recordedAt)}`}
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
