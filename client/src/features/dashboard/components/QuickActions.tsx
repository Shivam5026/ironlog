import { useNavigate } from "react-router-dom";
import { Play, Timer, Plus, Dumbbell } from "lucide-react";

import { QuickActionCard } from "./QuickActionCard";
import { useRecovery } from "@/features/workout-session/hooks/useRecovery";

interface QuickActionsProps {
  todayPlanId?: string;
}

export function QuickActions({ todayPlanId }: QuickActionsProps) {
  const navigate = useNavigate();
  const { data: activeSession, isPending } = useRecovery();

  const startWorkoutHref = todayPlanId
    ? `/dashboard/workout-plans/${todayPlanId}`
    : "/dashboard/workout-plans";

  const hasActiveSession = Boolean(activeSession);

  const handleContinueWorkout = () => {
    if (activeSession) {
      navigate(`/dashboard/workout/${activeSession.id}`);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <QuickActionCard
        title="Start Workout"
        icon={Play}
        href={startWorkoutHref}
        subtitle={todayPlanId ? "Today's plan" : "Pick a plan"}
      />
      <QuickActionCard
        title="Continue Workout"
        icon={Timer}
        disabled={!hasActiveSession}
        onClick={hasActiveSession ? handleContinueWorkout : undefined}
        subtitle={
          hasActiveSession
            ? "Resume session"
            : isPending
              ? "Checking…"
              : "No active workout"
        }
      />
      <QuickActionCard
        title="Create Workout Plan"
        icon={Plus}
        href="/dashboard/workout-plans/new"
      />
      <QuickActionCard
        title="View Exercise Library"
        icon={Dumbbell}
        href="/dashboard/exercises"
      />
    </div>
  );
}