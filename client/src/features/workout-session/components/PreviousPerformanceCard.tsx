import { Loader2, History } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { PersonalRecordBadge } from "./PersonalRecordBadge";
import { ProgressIndicator } from "./ProgressIndicator";
import { usePreviousPerformance } from "../hooks/usePerformance";
import type { PreviousPerformance } from "../types/performance";

interface PreviousPerformanceCardProps {
  exerciseId: string;
  currentWeight: number;
  currentReps: number;
}

function Stats({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function PreviousPerformanceCard({
  exerciseId,
  currentWeight,
  currentReps,
}: PreviousPerformanceCardProps) {
  const { data: performance, isPending, isError } = usePreviousPerformance(exerciseId);

  if (isPending) {
    return (
      <Card size="sm">
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !performance) {
    return (
      <Card size="sm">
        <CardContent className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          No previous performance for this exercise yet.
        </CardContent>
      </Card>
    );
  }

  const isNewBest =
    currentWeight > 0 &&
    (currentWeight > performance.bestWeight ||
      (currentWeight === performance.bestWeight && currentReps > performance.bestReps));

  const weightDelta = currentWeight > 0 ? currentWeight - performance.lastWeight : 0;
  const trend =
    currentWeight === 0
      ? ("flat" as const)
      : weightDelta > 0
        ? ("up" as const)
        : weightDelta < 0
          ? ("down" as const)
          : ("flat" as const);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          Previous Performance
          {isNewBest && <PersonalRecordBadge label="New PR" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          <Stats label="Best" value={`${performance.bestWeight} × ${performance.bestReps}`} />
          <Stats label="Last" value={`${performance.lastWeight} × ${performance.lastReps}`} />
          <Stats label="Est. 1RM" value={performance.estimatedOneRepMax != null ? String(performance.estimatedOneRepMax) : "—"} />
          <Stats label="Now" value={currentWeight > 0 ? `${currentWeight} × ${currentReps}` : "—"} />
        </div>
        <ProgressIndicator
          trend={trend}
          label={trend === "flat" ? "No change" : `${Math.abs(weightDelta)} kg vs last`}
        />
      </CardContent>
    </Card>
  );
}
