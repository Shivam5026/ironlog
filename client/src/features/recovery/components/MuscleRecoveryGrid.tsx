import { RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { CardSkeleton } from "@/shared/components/ui/CardSkeleton";

import { useRecoveryMuscles } from "../hooks/useRecoveryMuscles";
import { MuscleRecoveryCard } from "./MuscleRecoveryCard";

/**
 * The six-group muscle recovery grid (Feature 6.2).
 *
 * Renders Chest, Back, Legs, Shoulders, Arms, and Core from the normalized
 * GET /api/recovery response, with its own TanStack Query-driven loading,
 * error, and retry states (the query key is shared with the summary cards so
 * no duplicate request is made).
 */
export function MuscleRecoveryGrid() {
  const { items, isPending, isError, error, refetch } = useRecoveryMuscles();

  if (isPending) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Loading muscle recovery grid"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} showHeader={false} rows={5} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Couldn't load muscle recovery"
        description={
          error instanceof Error ? error.message : "Something went wrong."
        }
        action={
          <Button
            variant="outline"
            onClick={() => void refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
      />
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Muscle recovery grid"
    >
      {items.map((item) => (
        <li key={item.muscle}>
          <MuscleRecoveryCard item={item} />
        </li>
      ))}
    </ul>
  );
}