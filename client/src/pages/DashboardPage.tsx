import { Link } from "react-router-dom";
import { Plus, Dumbbell, Flame, Calendar, ArrowRight, ListChecks } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Skeleton } from "@/shared/components/ui/Skeleton";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { useWorkoutPlans } from "@/features/workout-plans/hooks/useWorkoutPlans";
import { StatsGrid } from "@/features/dashboard/components/StatsGrid";
import { RecentPlans } from "@/features/dashboard/components/RecentPlans";
import { RecentTemplates } from "@/features/dashboard/components/RecentTemplates";
import { QuickActions } from "@/features/dashboard/components/QuickActions";

function GreetingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: profile, isPending: profileLoading } = useProfile();
  const { data: plans, isPending: plansLoading } = useWorkoutPlans();

  const loading = profileLoading || plansLoading;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome + streak */}
      <section className="flex flex-col gap-2">
        {profileLoading ? (
          <GreetingSkeleton />
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back{profile?.user?.name ? `, ${profile.user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Flame className="size-4 text-orange-500" />
              You're on a <span className="font-medium text-foreground">6-day streak</span> 🔥
            </p>
          </>
        )}
      </section>

      {/* Stats */}
      <StatsGrid />

      {/* Today's workout */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Calendar className="size-5 text-primary" />
            Today's Workout
          </h2>
        </div>

        {loading ? (
          <Card>
            <CardContent className="space-y-3 px-4 py-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ) : plans && plans.length > 0 ? (
          <Card className="border-l-4 border-l-primary">
            <CardContent className="px-4 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold capitalize">{plans[0].name}</p>
                  {plans[0].description && (
                    <p className="text-sm text-muted-foreground">{plans[0].description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ListChecks className="size-3.5" />
                      {plans[0].workoutDays?.length ?? 0} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-3.5" />
                      {plans[0].workoutDays?.reduce((s: number, d: any) => s + (d.exercises?.length ?? 0), 0) ?? 0} exercises
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">Up next</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/dashboard/workout-plans/${plans[0].id}`}>
                  <Button size="sm">
                    Start Workout
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
                <Link to="/dashboard/workout-plans/new">
                  <Button variant="outline" size="sm">
                    <Plus className="size-3.5" />
                    New Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="px-4 py-6 text-center">
              <Dumbbell className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="font-medium">No workouts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first plan to get started.</p>
              <Link to="/dashboard/workout-plans/new" className="mt-4 inline-block">
                <Button size="sm">
                  <Plus className="size-3.5" />
                  Create Plan
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent plans */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Plans</h2>
        <RecentPlans />
      </section>

      {/* Recent templates */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Templates</h2>
        <RecentTemplates />
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <QuickActions />
      </section>
    </div>
  );
}
