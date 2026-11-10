import { CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import type { RecoveryConsistency } from "../types/recovery.types";

interface RecoveryConsistencyCardProps {
  data: RecoveryConsistency;
}

function toneFor(percentage: number): string {
  if (percentage >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (percentage >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

/**
 * Recovery consistency (Feature 7.2).
 *
 * The share of observed training cycles in which the muscle reached full
 * recovery before its next training. Only cycles with an available recovery
 * estimate qualify, so when there is not yet enough history the card explains
 * that instead of showing a misleading 0% or 100%.
 */
export function RecoveryConsistencyCard({
  data,
}: RecoveryConsistencyCardProps) {
  const hasData =
    data.consistencyPercentage !== null && data.qualifyingRecoveryEvents > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Recovery Consistency
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How often muscles were fully recovered before being trained again.
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-muted-foreground">
            Not enough repeated training history to calculate consistency yet.
          </p>
        ) : (
          <div className="space-y-3">
            <p
              className={`text-3xl font-bold tabular-nums ${toneFor(
                data.consistencyPercentage ?? 0,
              )}`}
            >
              {data.consistencyPercentage}%
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(Math.max(data.consistencyPercentage ?? 0, 0), 100)}%` }}
                role="progressbar"
                aria-valuenow={data.consistencyPercentage ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Recovery consistency"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {data.completedRecoveryEvents} of {data.qualifyingRecoveryEvents}{" "}
              observed cycles recovered in time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
