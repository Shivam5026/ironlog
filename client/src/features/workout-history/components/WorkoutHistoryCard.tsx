import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Clock, Dumbbell, Weight } from "lucide-react";

import { Badge } from "@/shared/components/ui/Badge";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { relativeTime } from "@/shared/lib/relativeTime";
import { formatDuration } from "@/features/workout-session/utils/format";
import { formatDate, formatVolume } from "../utils/format";
import type { WorkoutHistoryItem } from "../types/workout-history.types";

export function WorkoutHistoryCard({ item }: { item: WorkoutHistoryItem }) {
  return (
    <Link to={`/dashboard/workout-history/${item.id}`} className="block">
      <Card className="transition hover:-translate-y-0.5 hover:border-primary/30">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-base font-medium">
                  {item.planName}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="truncate text-sm text-muted-foreground">
                  {item.dayName}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span>{formatDate(item.startedAt)}</span>
                <span className="text-muted-foreground/60">
                  ({relativeTime(item.startedAt)})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              {item.duration !== null && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4 text-primary/70" />
                  {formatDuration(item.duration)}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Dumbbell className="size-4 text-primary/70" />
                {item.exerciseCount}{" "}
                {item.exerciseCount === 1 ? "exercise" : "exercises"}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Weight className="size-4 text-primary/70" />
                {formatVolume(item.totalVolume)} kg
              </span>
              <Badge variant="outline" className="ml-1">
                View <ChevronRight className="size-3" />
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}