import { Flame, Calendar, Trophy } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useStreak } from "../hooks/useStreak";

function StreakSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i}>
          <CardContent className="py-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconColor,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-3">
          <div className={`rounded-full bg-muted p-2.5 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-bold">{value} days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StreakSummary() {
  const { data, isPending, isError, error } = useStreak();

  if (isPending) {
    return <StreakSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load streak"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        icon={Flame}
        label="Current Streak"
        value={data.currentStreak}
        iconColor="text-orange-500"
      />
      <StatCard
        icon={Trophy}
        label="Longest Streak"
        value={data.longestStreak}
        iconColor="text-yellow-500"
      />
      <StatCard
        icon={Calendar}
        label="Active Days"
        value={data.totalActiveDays}
        iconColor="text-blue-500"
      />
    </div>
  );
}
