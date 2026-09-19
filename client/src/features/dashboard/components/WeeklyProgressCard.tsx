import { Target } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import type { DashboardWeeklyProgress } from "../types/dashboard.types";

interface WeeklyProgressCardProps {
  progress: DashboardWeeklyProgress;
}

export function WeeklyProgressCard({ progress }: WeeklyProgressCardProps) {
  const { completedWorkouts, targetWorkouts } = progress;
  const pct =
    targetWorkouts > 0
      ? Math.min(100, Math.round((completedWorkouts / targetWorkouts) * 100))
      : 0;

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="size-4 text-primary" />
          Weekly Progress
        </div>

        <div className="mt-3">
          <p className="text-xl font-bold">
            {completedWorkouts}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {targetWorkouts} workouts
            </span>
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {pct >= 100 ? "Goal reached this week" : `${pct}% of your weekly goal`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}