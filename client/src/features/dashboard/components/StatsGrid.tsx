import { Layout, Bookmark, Calendar } from "lucide-react";

import { Skeleton } from "@/shared/components/ui/Skeleton";

import { useDashboardStats } from "../hooks/useDashboardStats";
import { StatsCard } from "./StatsCard";

export function StatsGrid() {
  const { data, isPending } = useDashboardStats();

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <Skeleton className="size-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats = data ?? {
    plans: 0,
    templates: 0,
    days: 0,
    exercises: 0,
    weeklyWorkouts: 0,
    streak: 0,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatsCard
        icon={Layout}
        label="Plans"
        value={stats.plans}
        sub={`${stats.days} total days`}
      />
      <StatsCard
        icon={Bookmark}
        label="Templates"
        value={stats.templates}
        sub={`${stats.exercises} total exercises`}
      />
      <StatsCard
        icon={Calendar}
        label="This Week"
        value={stats.weeklyWorkouts}
        sub={stats.streak > 0 ? `${stats.streak}-day streak` : "No sessions yet"}
      />
    </div>
  );
}