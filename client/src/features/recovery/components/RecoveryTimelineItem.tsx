import { History, Timer } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { relativeTime } from "@/shared/lib/relativeTime";
import { useSelectedMuscleStore } from "../store/selected-muscle-store";
import {
  formatHoursRemaining,
  formatRecoveryDateTime,
  recoveryPercentageTone,
  recoveryStatusMeta,
} from "../utils/recovery-format";
import type { RecoveryTimelineGroupItem } from "../types/recovery.types";

interface RecoveryTimelineItemProps {
  item: RecoveryTimelineGroupItem;
}

/** The right-hand estimate label for a timeline row (never fabricated). */
function estimateLabel(item: RecoveryTimelineGroupItem): string {
  if (item.lastTrainedAt === null) return "Not trained yet";
  if (item.estimatedHoursRemaining === null) return "Estimating…";
  if (item.estimatedHoursRemaining <= 0) return "Fully recovered";
  return `${formatHoursRemaining(item.estimatedHoursRemaining)} remaining`;
}

/**
 * One row of the recovery timeline (Feature 6.3). Shows the last workout, the
 * current recovery percentage and status, and the estimated time until full
 * recovery. Status always carries a text label, never just a color. The row is
 * highlighted when its group is the one selected in the shared store.
 */
export function RecoveryTimelineItem({ item }: RecoveryTimelineItemProps) {
  const selectedMuscle = useSelectedMuscleStore((state) => state.selectedMuscle);
  const isSelected = selectedMuscle === item.muscle;

  const meta = recoveryStatusMeta[item.status];
  const trained = item.lastTrainedAt !== null;

  return (
    <Card
      aria-label={`${item.muscle}: ${meta.label}, ${item.recoveryPercentage}% recovered`}
      className={cn(isSelected && "ring-2 ring-primary")}
    >
      <CardContent className="space-y-4 px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{item.muscle}</h3>
            <p className={cn("flex items-center gap-1.5 text-xs font-medium", meta.text)}>
              <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden="true" />
              {meta.label}
            </p>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {item.recoveryPercentage}%
          </p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              recoveryPercentageTone(item.recoveryPercentage),
            )}
            style={{ width: `${item.recoveryPercentage}%` }}
            role="progressbar"
            aria-valuenow={item.recoveryPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${item.muscle} recovery`}
          />
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <History className="size-3.5" aria-hidden="true" />
              Last workout
            </dt>
            <dd className="font-medium">
              {trained ? relativeTime(item.lastTrainedAt as string) : "Not trained yet"}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="size-3.5" aria-hidden="true" />
              Estimated full recovery
            </dt>
            <dd className="font-medium">
              {estimateLabel(item)}
              {trained &&
                item.estimatedHoursRemaining !== null &&
                item.estimatedHoursRemaining > 0 &&
                item.estimatedFullRecoveryAt !== null && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    · {formatRecoveryDateTime(item.estimatedFullRecoveryAt)}
                  </span>
                )}
            </dd>
          </div>
        </dl>

        {item.components.length > 1 && (
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label={`${item.muscle} breakdown`}
          >
            {item.components.map((component) => (
              <li key={component.muscle}>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-xs text-muted-foreground",
                    isSelected && "border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      recoveryPercentageTone(component.recoveryPercentage),
                    )}
                    aria-hidden="true"
                  />
                  {component.muscle} {component.recoveryPercentage}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
