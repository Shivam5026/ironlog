import { Flame } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { fatigueLevelMeta } from "../utils/recovery-format";
import type { OverallFatigue } from "../types/recovery.types";

interface FatigueIndicatorProps {
  overallFatigue: OverallFatigue;
}

export function FatigueIndicator({
  overallFatigue,
}: FatigueIndicatorProps) {
  const meta = fatigueLevelMeta[overallFatigue.level];
  const resting = overallFatigue.trainedCount === 0;

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="size-4 text-primary" aria-hidden="true" />
          Fatigue Level
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span
            className={cn("size-3 rounded-full", resting ? "bg-muted-foreground" : meta.dot)}
            aria-hidden="true"
          />
          <p className="text-2xl font-bold">
            {resting ? "Resting" : meta.label}
          </p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              resting ? "bg-muted text-muted-foreground" : meta.badge,
            )}
          >
            {resting ? "No fatigue" : overallFatigue.average + "% avg"}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {resting
            ? "No accumulated fatigue from recent workouts."
            : `${meta.description} Average muscle fatigue is ${overallFatigue.average}% across ${overallFatigue.trainedCount} muscle group${overallFatigue.trainedCount === 1 ? "" : "s"}.`}
        </p>
      </CardContent>
    </Card>
  );
}