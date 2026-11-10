import { Gauge } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { readinessLevelMeta } from "../utils/recovery-format";
import type { ReadinessLevel } from "../types/recovery.types";

interface ReadinessScoreCardProps {
  score: number;
  level: ReadinessLevel;
}

export function ReadinessScoreCard({ score, level }: ReadinessScoreCardProps) {
  const meta = readinessLevelMeta[level];

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Gauge className="size-4 text-primary" aria-hidden="true" />
          Daily Readiness
        </div>

        <div className="mt-3 flex items-baseline gap-1">
          <p className="text-2xl font-bold tabular-nums">{score}</p>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", meta.bar)}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Readiness score"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              meta.badge,
            )}
          >
            {meta.label}
          </span>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}