import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type { MuscleFrequencyGroup } from "../utils/muscle-group-map";
import type { RecoveryTrendsRange } from "../types/recovery.types";
import { formatTrendsRange } from "../utils/recovery-format";

interface MuscleRecoveryFrequencyChartProps {
  data: MuscleFrequencyGroup[];
  range: RecoveryTrendsRange;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MuscleFrequencyGroup }>;
}) {
  if (!active || !payload?.length) return null;

  const { muscle, count } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">{muscle}</div>
      <div className="font-medium">
        {count} {count === 1 ? "recovery cycle" : "recovery cycles"}
      </div>
    </div>
  );
}

/**
 * Muscle recovery frequency (Feature 7.1).
 *
 * A bar chart of qualifying recovery cycles per display group — the number of
 * in-range trainings whose model-estimated recovery completed before the end
 * of the selected range. Counts are rolled up from the 11 backend muscles into
 * the shared six display groups.
 */
export function MuscleRecoveryFrequencyChart({
  data,
  range,
}: MuscleRecoveryFrequencyChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Muscle Recovery Frequency</CardTitle>
        <p className="text-xs text-muted-foreground">
          Recovery cycles completed in the last {formatTrendsRange(range)}.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="muscle"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                className="text-xs"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="count"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
