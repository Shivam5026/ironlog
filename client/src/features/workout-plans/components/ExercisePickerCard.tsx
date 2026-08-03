import { ImageOff } from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { cn } from "@/shared/lib/utils";
import type { Exercise } from "@/features/exercise/types/exercise";

interface ExercisePickerCardProps {
  exercise: Exercise;
  selected: boolean;
  onSelect: (exercise: Exercise) => void;
}

/**
 * Compact clickable row for the picker sheet — reuses Exercise type + data
 * from the Exercise Library feature; no new search/fetch code here.
 */
export function ExercisePickerCard({ exercise, selected, onSelect }: ExercisePickerCardProps) {
  const bodyPart = exercise.bodyParts?.[0];
  const equipment = exercise.equipments?.[0];

  return (
    <button
      type="button"
      onClick={() => onSelect(exercise)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected && "border-primary bg-primary/5 ring-1 ring-primary",
      )}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        <img
          src={exercise.gifUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {!exercise.gifUrl && (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium capitalize">{exercise.name}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {bodyPart && <Badge variant="secondary">{bodyPart}</Badge>}
          {equipment && <Badge variant="outline">{equipment}</Badge>}
        </div>
      </div>
    </button>
  );
}
