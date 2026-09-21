import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useProfile } from "@/features/profile/hooks/useProfile";
import { RecentPlans } from "@/features/dashboard/components/RecentPlans";
import { RecentTemplates } from "@/features/dashboard/components/RecentTemplates";
import { QuickActions } from "@/features/dashboard/components/QuickActions";

import { useDashboard } from "../hooks/useDashboard";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { TodayWorkoutCard } from "../components/TodayWorkoutCard";
import { WorkoutStreakCard } from "../components/WorkoutStreakCard";
import { WeeklyProgressCard } from "../components/WeeklyProgressCard";
import { TotalWorkoutsCard } from "../components/TotalWorkoutsCard";
import { BodyWeightCard } from "../components/BodyWeightCard";
import { TotalVolumeCard } from "../components/TotalVolumeCard";
import { LastWorkoutCard } from "../components/LastWorkoutCard";

export default function DashboardPage() {
  const { data: profile, isPending: profileLoading } = useProfile();
  const { data: dashboard, isPending, isError, error } = useDashboard();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <DashboardHeader
        name={profile?.user?.name}
        streakCurrent={dashboard?.streak.current ?? 0}
        isLoading={profileLoading}
      />

      {/* Dashboard cards */}
      {isPending ? (
        <DashboardSkeleton />
      ) : isError || !dashboard ? (
        <ErrorState
          title="Couldn't load your dashboard"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
          action={
            <Link to="/dashboard/workout-plans/new">
              <Button variant="outline">
                <Plus className="size-3.5" />
                Create a Plan
              </Button>
            </Link>
          }
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TodayWorkoutCard workout={dashboard.todayWorkout} />
          <WorkoutStreakCard />
          <WeeklyProgressCard progress={dashboard.weeklyProgress} />
          <TotalWorkoutsCard total={dashboard.totalWorkouts} />
          <BodyWeightCard weight={dashboard.currentBodyWeight} />
          <TotalVolumeCard volume={dashboard.totalVolume} />
          <LastWorkoutCard workout={dashboard.lastWorkout} />
        </section>
      )}

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
        <QuickActions todayPlanId={dashboard?.todayWorkout?.planId} />
      </section>
    </div>
  );
}