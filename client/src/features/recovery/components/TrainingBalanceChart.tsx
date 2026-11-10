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
import type {
  RecoveryTrendsRange,
  TrainingBalanceItem,
} from "../types/recovery.types";
import { formatCompactNumber, formatTrendsRange } from "../utils/recovery-format";

interface TrainingBalanceChartProps {
  data: TrainingBalanceItem[];
  range: RecoveryTrendsRange;
}

function BalanceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrainingBalanceItem }>;
}) {
  if (!active || !payload?.length) return null;

  const { muscle, totalVolume, completedSets } = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <div className="text-muted-foreground">{muscle}</div>
      <div className="font-medium">Workload: {formatCompactNumber(totalVolume)}</div>
      <div className="text-muted-foreground">
        Weighted sets: {Math.round(completedSets * 10) / 10}
      </div>
    </div>
  );
}

/**
 * Training balance (Feature 7.2).
 *
 * Contribution-weighted workload per muscle, ranked highest first. Because the
 * workload is normalized by muscle role (primary 100% / secondary 40% /
 * stabilizer 20%), muscles can be compared fairly — unlike raw tonnage, which
 * would overstate muscles that assist heavier compound lifts.
 */
export function TrainingBalanceChart({ data, range }: TrainingBalanceChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Training Balance</CardTitle>
        <p className="text-xs text-muted-foreground">
          Contribution-weighted workload per muscle in the last{" "}
          {formatTrendsRange(range)} — reveals over- and under-trained groups.
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="muscle"
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => formatCompactNumber(v)}
              />
              <Tooltip content={<BalanceTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar
                dataKey="totalVolume"
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
