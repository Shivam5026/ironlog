import { useState, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";

import type { WorkoutDay } from "../types";
import { ExerciseList } from "./ExerciseList";
import { ExercisePickerDialog } from "@/features/workout-plans/components/ExercisePickerDialog";
import { AddExerciseButton } from "@/features/workout-plans/components/AddExerciseButton";

interface WorkoutDayCardProps {
  day: WorkoutDay;
  onRename: (day: WorkoutDay) => void;
  onDelete: (day: WorkoutDay) => void;
  dragHandle?: ReactNode;
  isDragging?: boolean;
}

export function WorkoutDayCard({ day, onRename, onDelete, dragHandle, isDragging }: WorkoutDayCardProps) {
  const exercises = day.exercises ?? [];
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Card className={isDragging ? "opacity-50 ring-2 ring-primary" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {dragHandle}
            <CardTitle className="text-lg capitalize">{day.name}</CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary">
              {exercises.length} {exercises.length === 1 ? "exercise" : "exercises"}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Rename day"
              onClick={() => onRename(day)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Delete day"
              onClick={() => onDelete(day)}
            >
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exercises.length > 0 ? (
          <ExerciseList
            exercises={[...exercises].sort((a, b) => a.order - b.order)}
            dayId={day.id}
            dayName={day.name}
          />
        ) : (
          <p className="py-2 text-sm text-muted-foreground">No exercises yet.</p>
        )}

        <div className="mt-4">
          <AddExerciseButton onClick={() => setPickerOpen(true)} />
        </div>
      </CardContent>

      <ExercisePickerDialog
        workoutDayId={day.id}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </Card>
  );
}
