import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Dumbbell, Trash2, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";

import { formatDuration } from "../utils/format";
import { useDeleteWorkout } from "../hooks/useDeleteWorkout";
import type { WorkoutHistoryEntry } from "../types/history";

interface WorkoutHistoryCardProps {
  entry: WorkoutHistoryEntry;
}

export function WorkoutHistoryCard({ entry }: WorkoutHistoryCardProps) {
  const [deleting, setDeleting] = useState(false);
  const deleteWorkout = useDeleteWorkout();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(true);
  };

  const confirmDelete = () => {
    deleteWorkout.mutate(entry.id);
    setDeleting(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleting(false);
  };

  return (
    <div className="group relative">
      {deleting && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-card/95 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium">Delete this workout?</p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={confirmDelete}
                disabled={deleteWorkout.isPending}
              >
                {deleteWorkout.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={cancelDelete}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Link to={`/dashboard/workout-history/${entry.id}`} className="block">
        <Card className="h-full transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
          <CardContent className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="font-medium capitalize">{entry.planName}</p>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(entry.startedAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(entry.duration ?? 0)}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {entry.exerciseNames.slice(0, 4).join(" · ") || "No exercises"}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-lg font-semibold tabular-nums">
                {Math.round(entry.totalVolume)} kg
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Dumbbell className="h-3.5 w-3.5" />
                {entry.exerciseCount} exercises
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete workout"
        className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
