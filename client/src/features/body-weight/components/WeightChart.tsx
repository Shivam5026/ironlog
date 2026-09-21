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
import { Scale } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent } from "@/shared/components/ui/Card";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import type { BodyWeightEntry } from "../types/body-weight.types";
import {
  filterByRange,
  toChartData,
  computeSummary,
  formatChartDate,
  formatChartWeight,
  type WeightChartRange,
} from "../utils/weight-chart";

const RANGE_OPTIONS: { label: string; value: WeightChartRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "All Time", value: "all" },
];

function Summary({ items }: { items: BodyWeightEntry[] }) {
  const summary = computeSummary(items);

  if (summary.current === null) return null;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div>
        <div className="text-muted-foreground">Current</div>
        <div className="font-medium">{summary.current} kg</div>
      </div>
      {summary.start !== null && (
        <div>
          <div className="text-muted-foreground">Start</div>
          <div className="font-medium">{summary.start} kg</div>
        </div>
      )}
      {summary.change !== null && (
        <div>
          <div className="text-muted-foreground">Change</div>
          <div
            className={`font-medium ${
              summary.change > 0
                ? "text-orange-500"
                : summary.change < 0
                  ? "text-green-500"
                  : ""
            }`}
          >
            {summary.change > 0 ? "+" : ""}
            {summary.change} kg
          </div>
        </div>
      )}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { date: string; weight: number } }>;
}) {
  if (!active || !payload?.length) return null;

  const { date, weight } = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">{formatChartDate(date)}</div>
      <div className="font-medium">{formatChartWeight(weight)}</div>
    </div>
  );
}

interface WeightChartProps {
  items: BodyWeightEntry[];
}

export function WeightChart({ items }: WeightChartProps) {
  const [range, setRange] = useState<WeightChartRange>("all");

  const filtered = filterByRange(items, range);
  const data = toChartData(filtered);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="No weight data yet"
        description="Log your first body weight to start tracking your progress."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Summary items={filtered} />

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
          {data.length === 1 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="text-3xl font-bold">{data[0].weight} kg</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {formatChartDate(data[0].date)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Add more entries to see a trend line.
              </div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
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
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v: number) => `${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
