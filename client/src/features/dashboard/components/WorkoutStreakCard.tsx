import { Flame } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import type { DashboardStreak } from "../types/dashboard.types";

interface WorkoutStreakCardProps {
  streak: DashboardStreak;
}

export function WorkoutStreakCard({ streak }: WorkoutStreakCardProps) {
  const dayLabel = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="size-4 text-orange-500" />
          Workout Streak
        </div>

        {streak.current > 0 ? (
          <div className="mt-3">
            <p className="text-xl font-bold">{dayLabel(streak.current)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Longest: {dayLabel(streak.longest)}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xl font-bold">0 days</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Log a workout to start a streak.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}