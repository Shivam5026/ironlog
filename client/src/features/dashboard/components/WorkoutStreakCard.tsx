import { Flame, Trophy, Calendar } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { useStreak } from "@/features/streak/hooks/useStreak";

function StreakCardSkeleton() {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="size-4 text-orange-500" />
          Workout Streak
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkoutStreakCard() {
  const { data, isPending, isError } = useStreak();

  if (isPending) {
    return <StreakCardSkeleton />;
  }

  const streak = data ?? { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };

  const dayLabel = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="size-4 text-orange-500" />
          Workout Streak
        </div>

        {isError ? (
          <div className="mt-3">
            <p className="text-xl font-bold">--</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Couldn't load streak data.
            </p>
          </div>
        ) : streak.currentStreak > 0 ? (
          <div className="mt-3">
            <p className="text-xl font-bold">{dayLabel(streak.currentStreak)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Current Streak</p>
            <div className="mt-3 flex gap-4 text-sm">
              <div>
                <p className="font-medium">{dayLabel(streak.longestStreak)}</p>
                <p className="text-xs text-muted-foreground">Longest</p>
              </div>
              <div>
                <p className="font-medium">{dayLabel(streak.totalActiveDays)}</p>
                <p className="text-xs text-muted-foreground">Active Days</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xl font-bold">0 days</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start your first workout to build your streak.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
