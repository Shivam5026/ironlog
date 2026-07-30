import { Link } from "react-router-dom";
import {
  Plus,
  Dumbbell,
  Flame,
  Calendar,
  ChevronRight,
  Layers,
  Timer,
  TrendingUp,
  Zap,
  ArrowRight,
  ListChecks,
} from "lucide-react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { Skeleton } from "@/shared/components/ui/Skeleton";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { useWorkoutPlans } from "@/features/workout-plans/hooks/useWorkoutPlans";

function GreetingSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-48" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 px-4 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: profile, isPending: profileLoading } = useProfile();
  const { data: plans, isPending: plansLoading, isError, error } = useWorkoutPlans();

  const loading = profileLoading || plansLoading;
  const exerciseCount = plans?.reduce((sum, p) => sum + (p.workoutDays?.length ?? 0), 0) ?? 0;

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

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Layers}
          label="Workout Plans"
          value={plans?.length ?? 0}
          sub={plans?.length ? `${exerciseCount} total days` : undefined}
        />
        <StatCard
          icon={Dumbbell}
          label="Exercises Logged"
          value="—"
          sub="Coming with sessions"
        />
        <StatCard
          icon={Timer}
          label="This Week"
          value="—"
          sub="No sessions yet"
        />
      </div>

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
                      <Layers className="size-3.5" />
                      {plans[0].workoutDays?.length ?? 0} days
                    </span>
                    <span className="flex items-center gap-1">
                      <ListChecks className="size-3.5" />
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

      {/* Weekly activity placeholder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <TrendingUp className="size-5 text-primary" />
            Weekly Activity
          </h2>
        </div>

        <Card>
          <CardContent className="px-4 py-6 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-6">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div className="size-8 rounded-md bg-muted" />
                  <span className="text-xs">{day}</span>
                </div>
              ))}
            </div>
            <p className="mt-6">Activity tracking coming soon.</p>
          </CardContent>
        </Card>
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Zap className="size-5 text-primary" />
          Quick Actions
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/dashboard/workout-plans/new">
            <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                <Plus className="size-6 text-primary" />
                <span className="text-sm font-medium">New Plan</span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/workout-plans">
            <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                <Layers className="size-6 text-primary" />
                <span className="text-sm font-medium">My Plans</span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/exercises">
            <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                <Dumbbell className="size-6 text-primary" />
                <span className="text-sm font-medium">Exercises</span>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard/profile">
            <Card className="cursor-pointer transition hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                <Zap className="size-6 text-primary" />
                <span className="text-sm font-medium">Profile</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
