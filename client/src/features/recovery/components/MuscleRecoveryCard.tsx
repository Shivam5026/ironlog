import type { KeyboardEvent } from "react";
import { Clock } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { relativeTime } from "@/shared/lib/relativeTime";
import { useSelectedMuscleStore } from "../store/selected-muscle-store";
import {
  recoveryPercentageTone,
  recoveryStatusMeta,
} from "../utils/recovery-format";
import type { MuscleRecoveryItem } from "../types/recovery.types";

interface MuscleRecoveryCardProps {
  item: MuscleRecoveryItem;
}

/**
 * One clickable tile in the six-group muscle recovery grid (Feature 6.2).
 * Selecting a group is a client-side preference kept in the shared Zustand
 * store; colors always come with readable text labels.
 */
export function MuscleRecoveryCard({ item }: MuscleRecoveryCardProps) {
  const selectedMuscle = useSelectedMuscleStore((state) => state.selectedMuscle);
  const selectMuscle = useSelectedMuscleStore((state) => state.selectMuscle);

  const isSelected = selectedMuscle === item.muscle;
  const meta = recoveryStatusMeta[item.status];

  const select = () => selectMuscle(item.muscle);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${item.muscle}, ${meta.label}, ${item.recoveryPercentage}% recovered`}
      onClick={select}
      onKeyDown={handleKeyDown}
      className={cn(
        "h-full cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected && "ring-2 ring-primary",
      )}
    >
      <CardContent className="flex h-full flex-col px-4 py-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">{item.muscle}</span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              meta.text,
            )}
          >
            <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden="true" />
            {meta.label}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold tabular-nums">
            {item.recoveryPercentage}%
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
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
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" />
          {item.lastTrainedAt !== null ? (
            <span>Last trained: {relativeTime(item.lastTrainedAt)}</span>
          ) : (
            <span>Not trained yet</span>
          )}
        </div>

        {item.components.length > 1 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${item.muscle} breakdown`}>
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