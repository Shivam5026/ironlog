import { Flame } from "lucide-react";

import { Skeleton } from "@/shared/components/ui/Skeleton";

interface DashboardHeaderProps {
  name?: string;
  streakCurrent: number;
  isLoading?: boolean;
}

function GreetingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

export function DashboardHeader({
  name,
  streakCurrent,
  isLoading,
}: DashboardHeaderProps) {
  if (isLoading) return <GreetingSkeleton />;

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back{name ? `, ${name.split(" ")[0]}` : ""}
      </h1>
      <p className="flex items-center gap-1.5 text-muted-foreground">
        <Flame className="size-4 text-orange-500" />
        {streakCurrent > 0 ? (
          <>
            You're on a{" "}
            <span className="font-medium text-foreground">
              {streakCurrent}-day streak
            </span>{" "}
            🔥
          </>
        ) : (
          "No active streak yet — log a workout to start one."
        )}
      </p>
    </section>
  );
}