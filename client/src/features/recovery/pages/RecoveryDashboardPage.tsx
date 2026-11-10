import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CalendarClock,
  ClipboardList,
  Grid3x3,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { CardSkeleton } from "@/shared/components/ui/CardSkeleton";

import { useRecoveryDashboard } from "../hooks/useRecoveryDashboard";
import { recoveryKeys } from "../queries/recovery-keys";
import { RecoveryCard } from "../components/RecoveryCard";
import { ReadinessScoreCard } from "../components/ReadinessScoreCard";
import { RecommendationCard } from "../components/RecommendationCard";
import { FatigueIndicator } from "../components/FatigueIndicator";
import { MuscleRecoveryGrid } from "../components/MuscleRecoveryGrid";
import { RecoveryTimeline } from "../components/RecoveryTimeline";
import { RecoveryTrends } from "../components/RecoveryTrends";
import { RecoveryReports } from "../components/RecoveryReports";

export default function RecoveryDashboardPage() {
  const queryClient = useQueryClient();
  const {
    summary,
    recommendation,
    overallFatigue,
    averageRecovery,
    hasWorkoutHistory,
  } = useRecoveryDashboard();

  const isPending = summary.isPending || recommendation.isPending;
  const isError = summary.isError || recommendation.isError;
  const error = summary.error ?? recommendation.error;

  const retry = () => queryClient.refetchQueries({ queryKey: recoveryKeys.all });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Activity className="h-8 w-8" aria-hidden="true" />
          Recovery
        </h1>
        <p className="text-sm text-muted-foreground">
          Your muscle recovery, daily readiness, training fatigue, and today's
          recommendation.
        </p>
      </header>

      {isPending ? (
        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Loading recovery cards"
        >
          <CardSkeleton showHeader={false} rows={5} />
          <CardSkeleton showHeader={false} rows={4} />
          <CardSkeleton showHeader={false} rows={5} />
          <CardSkeleton showHeader={false} rows={4} />
        </section>
      ) : isError || !summary.data || !recommendation.data ? (
        <ErrorState
          title="Couldn't load your recovery"
          description={
            error instanceof Error ? error.message : "Something went wrong."
          }
          action={
            <Button variant="outline" onClick={() => void retry()}>
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          }
        />
      ) : (
        <>
          {!hasWorkoutHistory && (
            <div
              role="status"
              className="rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground"
            >
              No workout history yet — your recovery, readiness, and fatigue
              cards will fill in after your first completed workout.
            </div>
          )}

          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Recovery summary cards"
          >
            <RecoveryCard
              muscles={summary.data.muscles}
              averageRecovery={averageRecovery}
              hasWorkoutHistory={hasWorkoutHistory}
            />

            <ReadinessScoreCard
              score={recommendation.data.readinessScore}
              level={recommendation.data.readinessLevel}
            />

            <RecommendationCard recommendation={recommendation.data} />

            <FatigueIndicator
              overallFatigue={
                overallFatigue ?? { level: "LOW", average: 0, trainedCount: 0 }
              }
            />
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Grid3x3 className="h-5 w-5" aria-hidden="true" />
              Muscle Recovery Grid
            </h2>
            <MuscleRecoveryGrid />
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarClock className="h-5 w-5" aria-hidden="true" />
              Recovery Timeline
            </h2>
            <RecoveryTimeline />
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="h-5 w-5" aria-hidden="true" />
              Recovery Trends
            </h2>
            <RecoveryTrends />
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <ClipboardList className="h-5 w-5" aria-hidden="true" />
              Recovery Reports
            </h2>
            <RecoveryReports />
          </section>
        </>
      )}
    </div>
  );
}