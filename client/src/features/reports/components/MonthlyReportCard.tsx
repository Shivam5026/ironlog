import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useMonthlyReport } from "../hooks/useMonthlyReport";
import { Dumbbell, Weight, TrendingUp, Trophy, Activity } from "lucide-react";

function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString();
}

interface Props {
  date?: string;
}

export function MonthlyReportCard({ date }: Props) {
  const { data, isLoading, error } = useMonthlyReport(date);

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
    return <ErrorState message="Failed to load monthly report" />;
  }

  if (!data) {
    return <EmptyState message="No report data available" />;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Monthly Report</h3>
          <span className="text-sm text-muted-foreground">
            {data.period.start} → {data.period.end}
          </span>
        </div>

        {/* Workout Frequency */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Dumbbell className="h-4 w-4" />
              Total Workouts
            </div>
            <div className="text-2xl font-bold">{data.workoutFrequency.totalWorkouts}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Activity className="h-4 w-4" />
              Avg / Week
            </div>
            <div className="text-2xl font-bold">{data.workoutFrequency.averagePerWeek}</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Weight className="h-4 w-4" />
              Total Volume
            </div>
            <div className="text-2xl font-bold">{formatVolume(data.overallProgress.totalVolume)}</div>
            {data.overallProgress.volumeChange !== 0 && (
              <div className={`text-xs mt-1 ${data.overallProgress.volumeChange > 0 ? "text-green-600" : "text-red-600"}`}>
                {data.overallProgress.volumeChange > 0 ? "+" : ""}{data.overallProgress.volumeChange}%
              </div>
            )}
          </div>
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Avg Duration
            </div>
            <div className="text-2xl font-bold">{data.overallProgress.averageWorkoutDuration}m</div>
          </div>
        </div>

        {/* Body Weight Trend */}
        {data.bodyWeightTrend.data.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-2">Body Weight Trend</h4>
            <div className="flex items-center gap-4 text-sm">
              <span>{data.bodyWeightTrend.startWeight} kg</span>
              <span className="text-muted-foreground">→</span>
              <span>{data.bodyWeightTrend.endWeight} kg</span>
              {data.bodyWeightTrend.change !== 0 && (
                <span className={`font-medium ${data.bodyWeightTrend.change > 0 ? "text-red-600" : "text-green-600"}`}>
                  {data.bodyWeightTrend.change > 0 ? "+" : ""}{data.bodyWeightTrend.change} kg
                </span>
              )}
            </div>
          </div>
        )}

        {/* Best-Performing Exercises */}
        {data.bestPerformingExercises.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Best-Performing Exercises
            </h4>
            <div className="space-y-1">
              {data.bestPerformingExercises.slice(0, 5).map((ex) => (
                <div
                  key={ex.exerciseId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{ex.exerciseName}</span>
                  <span className="font-medium">{ex.bestWeight} kg</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
