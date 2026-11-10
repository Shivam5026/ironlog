import { useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useRecoveryTrends } from "../hooks/useRecoveryTrends";
import { buildFrequencyByDisplayGroup } from "../utils/muscle-group-map";
import { AverageRecoveryTimeCard } from "./AverageRecoveryTimeCard";
import { MuscleRecoveryFrequencyChart } from "./MuscleRecoveryFrequencyChart";
import { WeeklyFatigueChart } from "./WeeklyFatigueChart";
import {
  RECOVERY_TRENDS_RANGES,
  type RecoveryTrendsRange,
} from "../types/recovery.types";

const RANGE_LABELS: Record<RecoveryTrendsRange, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
};

function RangeSelector({
  range,
  onChange,
}: {
  range: RecoveryTrendsRange;
  onChange: (range: RecoveryTrendsRange) => void;
}) {
  return (
    <div className="flex gap-1">
      {RECOVERY_TRENDS_RANGES.map((value) => (
        <Button
          key={value}
          variant={range === value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(value)}
        >
          {RANGE_LABELS[value]}
        </Button>
      ))}
    </div>
  );
}

function TrendsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading recovery trends">
      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="py-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Recovery trends (Feature 7.1).
 *
 * Owns the range selection and its TanStack Query, and composes the
 * model-vs-observed recovery time card with the per-muscle frequency and
 * weekly fatigue charts. Shares the `["recovery", "trends", range]` key (and
 * its `["recovery"]` prefix) so it refreshes on workout completion.
 */
export function RecoveryTrends() {
  const [range, setRange] = useState<RecoveryTrendsRange>("30d");
  const { data, isPending, isError, error, refetch } = useRecoveryTrends(range);

  if (isPending) return <TrendsSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your recovery trends"
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

  const frequency = buildFrequencyByDisplayGroup(data?.recoveryFrequency ?? []);
  const weeklyFatigue = data?.weeklyFatigue ?? [];

  const hasData =
    (data?.averageRecoveryHours ?? null) !== null ||
    (data?.observedRecoveryHours ?? null) !== null ||
    frequency.some((entry) => entry.count > 0) ||
    weeklyFatigue.some((entry) => entry.averageFatigue > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <RangeSelector range={range} onChange={setRange} />
      </div>

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No recovery trends yet"
          description="Complete a few workouts and your recovery time, muscle recovery frequency, and weekly fatigue trends will appear here."
        />
      ) : (
        <>
          <AverageRecoveryTimeCard
            averageRecoveryHours={data?.averageRecoveryHours ?? null}
            observedRecoveryHours={data?.observedRecoveryHours ?? null}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <MuscleRecoveryFrequencyChart data={frequency} range={range} />
            <WeeklyFatigueChart data={weeklyFatigue} />
          </div>
        </>
      )}
    </div>
  );
}
