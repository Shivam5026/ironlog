import { Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import type {
  FastestRecoveringMuscle,
  RecoveryTrendsRange,
} from "../types/recovery.types";
import { formatRecoveryDuration, formatTrendsRange } from "../utils/recovery-format";

interface FastestRecoveringMuscleCardProps {
  data: FastestRecoveringMuscle | null;
  range: RecoveryTrendsRange;
}

/**
 * Fastest recovering muscle (Feature 7.2).
 *
 * The muscle with the shortest average recovery duration in the period. A badge
 * makes the source explicit: "Observed" when measured between repeat trainings,
 * "Estimated" when no repeat training was seen and the model's configured
 * duration is used instead — estimated figures are never presented as observed.
 */
export function FastestRecoveringMuscleCard({
  data,
  range,
}: FastestRecoveringMuscleCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" aria-hidden="true" />
          Fastest Recovering Muscle
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Shortest recovery time in the last {formatTrendsRange(range)}.
        </p>
      </CardHeader>
      <CardContent>
        {data === null ? (
          <p className="text-sm text-muted-foreground">
            Not enough training history to identify a recovering muscle yet.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-bold">{data.muscle}</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums">
                {formatRecoveryDuration(data.averageRecoveryHours)}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  data.isEstimated
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                )}
              >
                {data.isEstimated ? "Estimated" : "Observed"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {data.isEstimated
                ? "Based on the model's configured recovery time — no repeat training observed."
                : "Average time actually observed between repeat trainings."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
