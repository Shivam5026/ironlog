import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dumbbell } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useExerciseDistribution } from "../hooks/useExerciseDistribution";
import type { AnalyticsRange, ExerciseDistributionItem } from "../types/analytics.types";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const CHART_LIMIT = 10;

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ExerciseDistributionItem }>;
}) {
  if (!active || !payload?.length) return null;

  const { exerciseName, count } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-medium">{exerciseName}</div>
      <div className="text-muted-foreground">
        {count} session{count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function SummaryCards({ data }: { data: ExerciseDistributionItem[] }) {
  if (data.length === 0) return null;

  const most = data[0];
  const least = data[data.length - 1];

  return (
    <div className="flex gap-4 text-sm">
      <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2">
        <div className="text-muted-foreground">Most performed</div>
        <div className="font-medium truncate">{most.exerciseName}</div>
        <div className="text-muted-foreground">
          {most.count} time{most.count === 1 ? "" : "s"}
        </div>
      </div>
      {data.length > 1 && (
        <div className="flex-1 rounded-lg border bg-muted/50 px-3 py-2">
          <div className="text-muted-foreground">Least performed</div>
          <div className="font-medium truncate">{least.exerciseName}</div>
          <div className="text-muted-foreground">
            {least.count} time{least.count === 1 ? "" : "s"}
          </div>
        </div>
      )}
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

export function ExerciseDistributionChart() {
  const [range, setRange] = useState<AnalyticsRange>("all");
  const { data, isPending, isError, error } = useExerciseDistribution(range);

  if (isPending) return <ChartSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load exercise distribution"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
      />
    );
  }

  const allData = data?.data ?? [];
  const totalSessions = data?.totalSessions ?? 0;
  const chartData = allData.slice(0, CHART_LIMIT);

  if (chartData.length === 0) {
    return (
      <div className="space-y-4">
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
        <EmptyState
          icon={Dumbbell}
          title="No exercise data yet"
          description="Complete a workout with logged exercises to see your distribution."
        />
      </div>
    );
  }

  const maxCount = Math.max(...chartData.map((d) => d.count));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {totalSessions} completed session{totalSessions === 1 ? "" : "s"} — {allData.length} unique exercise{allData.length === 1 ? "" : "s"}
        </div>

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

      <SummaryCards data={allData} />

      <Card>
        <CardContent className="py-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="category"
                  dataKey="exerciseName"
                  width={140}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
