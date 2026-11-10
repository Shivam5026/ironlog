import { useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useRecoveryReports } from "../hooks/useRecoveryReports";
import { MostFatiguedMuscleCard } from "./MostFatiguedMuscleCard";
import { FastestRecoveringMuscleCard } from "./FastestRecoveringMuscleCard";
import { TrainingBalanceChart } from "./TrainingBalanceChart";
import { RecoveryConsistencyCard } from "./RecoveryConsistencyCard";
import { RecoveryReportFilters } from "./RecoveryReportFilters";
import type { RecoveryTrendsRange } from "../types/recovery.types";

function ReportsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading recovery reports">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="py-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-72 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Recovery reports (Feature 7.2).
 *
 * Owns the report period and its TanStack Query, then composes the four
 * insights: most fatigued muscle, fastest recovering muscle, training balance,
 * and recovery consistency — each with a short explanation of how it is
 * derived. Shares the `["recovery", "reports", range]` key so a completed
 * workout invalidates it alongside the rest of the dashboard.
 */
export function RecoveryReports() {
  const [range, setRange] = useState<RecoveryTrendsRange>("30d");
  const { data, isPending, isError, error, refetch } = useRecoveryReports(range);

  if (isPending) return <ReportsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your recovery reports"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
        action={
          <Button variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
      />
    );
  }

  const consistency = data?.recoveryConsistency ?? {
    qualifyingRecoveryEvents: 0,
    completedRecoveryEvents: 0,
    consistencyPercentage: null,
  };
  const trainingBalance = data?.trainingBalance ?? [];

  const hasData =
    (data?.mostFatiguedMuscle ?? null) !== null ||
    (data?.fastestRecoveringMuscle ?? null) !== null ||
    trainingBalance.length > 0 ||
    consistency.qualifyingRecoveryEvents > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <RecoveryReportFilters range={range} onChange={setRange} />
      </div>

      {!hasData ? (
        <EmptyState
          icon={ClipboardList}
          title="No recovery report yet"
          description="Complete a few workouts and this report will surface your most fatigued and fastest recovering muscles, training balance, and how consistently you recover."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MostFatiguedMuscleCard
              data={data?.mostFatiguedMuscle ?? null}
              range={range}
            />
            <FastestRecoveringMuscleCard
              data={data?.fastestRecoveringMuscle ?? null}
              range={range}
            />
            <RecoveryConsistencyCard data={consistency} />
          </div>

          {trainingBalance.length > 0 && (
            <TrainingBalanceChart data={trainingBalance} range={range} />
          )}

          <p className="text-xs text-muted-foreground">
            Fatigue and workload come from the same recovery engine used across
            the dashboard. Training balance is contribution-weighted by muscle
            role, and estimated recovery times are always labelled as such.
          </p>
        </>
      )}
    </div>
  );
}
