import { CalendarClock, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { CardSkeleton } from "@/shared/components/ui/CardSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ErrorState } from "@/shared/components/ui/ErrorState";

import { useRecoveryTimeline } from "../hooks/useRecoveryTimeline";
import { RecoveryTimelineItem } from "./RecoveryTimelineItem";

/**
 * Recovery timeline (Feature 6.3).
 *
 * Lists last workout, current recovery, and estimated full recovery for the
 * six display groups. Owns its TanStack Query loading/error/empty states so it
 * can be rendered standalone; the query key shares the `["recovery"]` prefix
 * and refreshes when a workout is completed.
 */
export function RecoveryTimeline() {
  const { items, isPending, isError, error, refetch } = useRecoveryTimeline();

  if (isPending) {
    return (
      <div className="space-y-3" aria-label="Loading recovery timeline">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} showHeader={false} rows={3} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load your recovery timeline"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
        action={
          <Button variant="outline" onClick={() => void refetch()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
      />
    );
  }

  const hasHistory = items.some((item) => item.lastTrainedAt !== null);

  if (!hasHistory) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="No training history yet"
        description="Complete a workout and your recovery timeline — last workout, current recovery, and estimated full recovery — will appear here."
      />
    );
  }

  return (
    <ul className="space-y-3" aria-label="Recovery timeline">
      {items.map((item) => (
        <li key={item.muscle}>
          <RecoveryTimelineItem item={item} />
        </li>
      ))}
    </ul>
  );
}
