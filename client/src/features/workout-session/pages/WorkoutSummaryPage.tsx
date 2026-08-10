import { useParams, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useWorkoutSummary } from "../hooks/useWorkoutSummary";
import { useActiveWorkout } from "../hooks/useActiveWorkout";
import { SummaryHeader } from "../components/SummaryHeader";
import { WorkoutStatsCard } from "../components/WorkoutStatsCard";
import { ExerciseSummaryList } from "../components/ExerciseSummaryList";
import { PersonalRecordsCard } from "../components/PersonalRecordsCard";
import { AchievementBanner } from "../components/AchievementBanner";
import { ShareWorkoutCard } from "../components/ShareWorkoutCard";
import { SummaryActions } from "../components/SummaryActions";

export default function WorkoutSummaryPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { data: summary, isPending, isError, error } = useWorkoutSummary(sessionId ?? "");
  const { data: session } = useActiveWorkout(sessionId ?? "");

  if (!sessionId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <ErrorState
        title="Failed to load summary"
        description={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SummaryHeader summary={summary} />

      <AchievementBanner
        personalRecordCount={summary.personalRecords.length}
        completedExercises={summary.completedExercises}
        totalExercises={summary.totalExercises}
      />

      <WorkoutStatsCard
        totalVolume={summary.totalVolume}
        totalReps={summary.totalReps}
        totalSets={summary.totalSets}
        completedSets={summary.completedSets}
        totalExercises={summary.totalExercises}
        completedExercises={summary.completedExercises}
        estimatedCalories={summary.estimatedCalories}
      />

      {summary.personalRecords.length > 0 && (
        <PersonalRecordsCard records={summary.personalRecords} />
      )}

      <ExerciseSummaryList exercises={summary.exercises} />

      <ShareWorkoutCard summary={summary} />

      <SummaryActions
        workoutPlanId={session?.workoutPlanId ?? ""}
        workoutDayId={session?.workoutDayId ?? ""}
      />
    </div>
  );
}