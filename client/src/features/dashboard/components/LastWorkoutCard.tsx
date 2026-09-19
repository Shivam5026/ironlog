import { History, Clock } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { relativeTime } from "@/shared/lib/relativeTime";
import { formatDuration } from "@/features/workout-session/utils/format";
import { capitalize, formatVolume } from "../utils/format";
import type { DashboardLastWorkout } from "../types/dashboard.types";

interface LastWorkoutCardProps {
  workout: DashboardLastWorkout | null;
}

export function LastWorkoutCard({ workout }: LastWorkoutCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="size-4 text-primary" />
          Last Workout
        </div>

        {workout ? (
          <div className="mt-3">
            <p className="text-xl font-bold">
              {capitalize(workout.planName)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                · {capitalize(workout.dayName)}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {relativeTime(workout.completedAt)}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {workout.duration !== null ? formatDuration(workout.duration) : "—"}
              </span>
              <span className="flex items-center gap-1">
                <History className="size-3.5" />
                {formatVolume(workout.totalVolume)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xl font-bold">No workouts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your first workout and it will show up here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}