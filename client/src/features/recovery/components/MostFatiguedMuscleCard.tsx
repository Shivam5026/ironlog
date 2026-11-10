import { Flame } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import type { MostFatiguedMuscle, RecoveryTrendsRange } from "../types/recovery.types";
import { formatTrendsRange } from "../utils/recovery-format";

interface MostFatiguedMuscleCardProps {
  data: MostFatiguedMuscle | null;
  range: RecoveryTrendsRange;
}

/**
 * Most fatigued muscle (Feature 7.2).
 *
 * The muscle group carrying the highest recent fatigue score over the selected
 * period, calculated by the shared fatigue engine (volume, sets, intensity,
 * frequency, and recency, then time decay). Untrained muscles are ignored.
 */
export function MostFatiguedMuscleCard({
  data,
  range,
}: MostFatiguedMuscleCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-4 w-4" aria-hidden="true" />
          Most Fatigued Muscle
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Highest fatigue over the last {formatTrendsRange(range)}.
        </p>
      </CardHeader>
      <CardContent>
        {data === null ? (
          <p className="text-sm text-muted-foreground">
            No training fatigue recorded in this period.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold">{data.muscle}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums">
                {data.fatigueScore}
              </span>
              <span className="text-xs text-muted-foreground">/ 100 fatigue</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${Math.min(Math.max(data.fatigueScore, 0), 100)}%` }}
                role="progressbar"
                aria-valuenow={data.fatigueScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${data.muscle} fatigue`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
