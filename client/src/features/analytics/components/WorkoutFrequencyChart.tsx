import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useWorkoutFrequency } from "../hooks/useWorkoutFrequency";
import type { AnalyticsRange, FrequencyChartPoint } from "../types/analytics.types";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function Summary({ data }: { data: FrequencyChartPoint[] }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.workouts, 0);
  const avg = (total / data.length).toFixed(1);
  const peak = Math.max(...data.map((d) => d.workouts));

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">Total</div>
        <div className="font-medium">{total} workouts</div>
      </div>
      <div>
        <div className="text-muted-foreground">Avg / period</div>
        <div className="font-medium">{avg}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Peak</div>
        <div className="font-medium">{peak}</div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FrequencyChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const { period, workouts } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">{period}</div>
      <div className="font-medium">
        {workouts} workout{workouts === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Card>
        <CardContent className="py-4">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function WorkoutFrequencyChart() {
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const { data, isPending, isError, error } = useWorkoutFrequency(range);

  if (isPending) return <ChartSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load workout frequency"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
      />
    );
  }

  const chartData = data?.data ?? [];

  if (chartData.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No workout frequency yet"
        description="Complete a workout to start tracking your training frequency."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Summary data={chartData} />

        <div className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={range === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="workouts"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
