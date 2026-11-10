import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import type { WeeklyFatigueEntry } from "../types/recovery.types";
import { formatWeekStart } from "../utils/recovery-format";

interface WeeklyFatigueChartProps {
  data: WeeklyFatigueEntry[];
}

interface FatiguePoint {
  week: string;
  averageFatigue: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FatiguePoint }>;
}) {
  if (!active || !payload?.length) return null;

  const { week, averageFatigue } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">Week of {week}</div>
      <div className="font-medium">Avg fatigue: {averageFatigue}</div>
    </div>
  );
}

/**
 * Weekly fatigue trend (Feature 7.1).
 *
 * The fatigue engine's per-muscle scores averaged across each calendar week,
 * so an upward line flags weeks with accumulating training fatigue. Weeks
 * without training report 0 rather than a fabricated score.
 */
export function WeeklyFatigueChart({ data }: WeeklyFatigueChartProps) {
  const chartData: FatiguePoint[] = data.map((entry) => ({
    week: formatWeekStart(entry.weekStart),
    averageFatigue: entry.averageFatigue,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly Fatigue</CardTitle>
        <p className="text-xs text-muted-foreground">
          Average muscle fatigue per calendar week.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="week"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                className="text-xs"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="averageFatigue"
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
  );
}
