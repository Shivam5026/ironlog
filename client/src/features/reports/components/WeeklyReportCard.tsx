import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useWeeklyReport } from "../hooks/useWeeklyReport";
import { Dumbbell, Weight, Clock, Trophy, Activity } from "lucide-react";

function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString();
}

interface Props {
  date?: string;
}

export function WeeklyReportCard({ date }: Props) {
  const { data, isLoading, error } = useWeeklyReport(date);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load weekly report" />;
  }

  if (!data) {
    return <EmptyState message="No report data available" />;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Weekly Report</h3>
          <span className="text-sm text-muted-foreground">
            {data.period.start} → {data.period.end}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Dumbbell className="h-4 w-4" />
              Workouts
            </div>
            <div className="text-2xl font-bold">{data.summary.totalWorkouts}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Weight className="h-4 w-4" />
              Volume
            </div>
            <div className="text-2xl font-bold">{formatVolume(data.summary.totalVolume)}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Clock className="h-4 w-4" />
              Avg Duration
            </div>
            <div className="text-2xl font-bold">{data.summary.averageDuration}m</div>
          </div>
        </div>

        {/* Muscle Distribution */}
        {data.muscleDistribution.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Muscle Distribution
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.muscleDistribution.map((m) => (
                <span
                  key={m.muscle}
                  className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {m.muscle} × {m.frequency}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal Records */}
        {data.personalRecords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Personal Records
            </h4>
            <div className="space-y-1">
              {data.personalRecords.map((pr) => (
                <div
                  key={`${pr.exerciseId}-${pr.achievedAt}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{pr.exerciseName}</span>
                  <span className="font-medium">{pr.bestWeight} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
