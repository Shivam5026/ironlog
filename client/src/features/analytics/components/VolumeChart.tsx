import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useVolumeAnalytics } from "../hooks/useVolumeAnalytics";
import type { AnalyticsRange, VolumeChartPoint } from "../types/analytics.types";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function formatChartDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return `${v}`;
}

function Summary({ data }: { data: VolumeChartPoint[] }) {
  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.volume, 0);
  const avg = Math.round(total / data.length);
  const max = Math.max(...data.map((d) => d.volume));

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">Total</div>
        <div className="font-medium">{formatVolume(total)} kg</div>
      </div>
      <div>
        <div className="text-muted-foreground">Avg / day</div>
        <div className="font-medium">{formatVolume(avg)} kg</div>
      </div>
      <div>
        <div className="text-muted-foreground">Peak</div>
        <div className="font-medium">{formatVolume(max)} kg</div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: VolumeChartPoint }>;
}) {
  if (!active || !payload?.length) return null;

  const { date, volume } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">{formatChartDate(date)}</div>
      <div className="font-medium">Volume: {volume.toLocaleString()} kg</div>
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

export function VolumeChart() {
  const [range, setRange] = useState<AnalyticsRange>("7d");
  const { data, isPending, isError, error } = useVolumeAnalytics(range);

  if (isPending) return <ChartSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load volume data"
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
        icon={BarChart3}
        title="No workout volume yet"
        description="Complete a workout to start tracking your training volume."
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
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatChartDate}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v: number) => formatVolume(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
