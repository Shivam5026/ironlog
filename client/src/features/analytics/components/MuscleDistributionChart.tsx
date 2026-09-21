import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useMuscleDistribution } from "../hooks/useMuscleDistribution";
import type { AnalyticsRange, MuscleDistributionItem } from "../types/analytics.types";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const MUSCLE_COLORS: Record<string, string> = {
  Chest: "hsl(0, 70%, 55%)",
  Back: "hsl(210, 70%, 50%)",
  Legs: "hsl(150, 60%, 40%)",
  Shoulders: "hsl(30, 80%, 55%)",
  Arms: "hsl(280, 60%, 50%)",
  Core: "hsl(50, 80%, 50%)",
};

const COLOR_LIST = Object.values(MUSCLE_COLORS);

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MuscleDistributionItem }>;
}) {
  if (!active || !payload?.length) return null;

  const { muscle, count } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-medium">{muscle}</div>
      <div className="text-muted-foreground">
        {count} exercise performance{count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function LegendPayload({ data, total }: { data: MuscleDistributionItem[]; total: number }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      {data.map((item) => (
        <div key={item.muscle} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: MUSCLE_COLORS[item.muscle] ?? "hsl(var(--muted-foreground))" }}
          />
          <span className="flex-1">{item.muscle}</span>
          <span className="text-muted-foreground">
            {total > 0 ? Math.round((item.count / total) * 100) : 0}%
          </span>
        </div>
      ))}
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

export function MuscleDistributionChart() {
  const [range, setRange] = useState<AnalyticsRange>("all");
  const { data, isPending, isError, error } = useMuscleDistribution(range);

  if (isPending) return <ChartSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load muscle distribution"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
      />
    );
  }

  const chartData = data?.data ?? [];
  const totalSessions = data?.totalSessions ?? 0;

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
          icon={Target}
          title="No muscle data yet"
          description="Complete a workout with logged exercises to see your muscle distribution."
        />
      </div>
    );
  }

  const total = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {totalSessions} completed session{totalSessions === 1 ? "" : "s"} — {chartData.length} muscle group{chartData.length === 1 ? "" : "s"} trained
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

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="muscle"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.muscle}
                        fill={MUSCLE_COLORS[entry.muscle] ?? "hsl(var(--muted-foreground))"}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:w-1/2">
              <LegendPayload data={chartData} total={total} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
