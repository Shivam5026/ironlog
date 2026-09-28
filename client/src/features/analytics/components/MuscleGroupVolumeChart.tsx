import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Activity } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { useMuscleGroupVolume } from "../hooks/useMuscleGroupVolume";
import type { AnalyticsRange, MuscleGroupVolumeItem } from "../types/analytics.types";

const RANGE_OPTIONS: { label: string; value: AnalyticsRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

const COLORS = [
  "hsl(0, 70%, 50%)",
  "hsl(210, 70%, 50%)",
  "hsl(140, 60%, 45%)",
  "hsl(40, 90%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(180, 60%, 40%)",
];

function formatVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return `${v}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MuscleGroupVolumeItem }>;
}) {
  if (!active || !payload?.length) return null;
  const { muscleGroup, volume } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="font-medium">{muscleGroup}</div>
      <div className="text-muted-foreground">{formatVolume(volume)} kg</div>
    </div>
  );
}

function SummaryCards({ data }: { data: MuscleGroupVolumeItem[] }) {
  const total = data.reduce((sum, d) => sum + d.volume, 0);
  const trained = data.filter((d) => d.volume > 0);
  const max = data.reduce((m, d) => (d.volume > m.volume ? d : m), data[0]);

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">Total</div>
        <div className="font-medium">{formatVolume(total)} kg</div>
      </div>
      <div>
        <div className="text-muted-foreground">Groups trained</div>
        <div className="font-medium">{trained.length} / {data.length}</div>
      </div>
      {max && max.volume > 0 && (
        <div>
          <div className="text-muted-foreground">Highest</div>
          <div className="font-medium">{max.muscleGroup} ({formatVolume(max.volume)} kg)</div>
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

export function MuscleGroupVolumeChart() {
  const [range, setRange] = useState<AnalyticsRange>("all");
  const { data, isPending, isError, error } = useMuscleGroupVolume(range);

  if (isPending) return <ChartSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load muscle group volume"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
      />
    );
  }

  const chartData = data?.filter((d) => d.volume > 0) ?? [];
  const allData = data ?? [];

  if (allData.every((d) => d.volume === 0)) {
    return (
      <EmptyState
        icon={Activity}
        title="No muscle group volume yet"
        description="Complete a workout to start tracking volume by muscle group."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SummaryCards data={allData} />

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
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="volume"
                  nameKey="muscleGroup"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ muscleGroup, volume }) =>
                    `${muscleGroup}: ${formatVolume(volume)} kg`
                  }
                  labelLine={false}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
