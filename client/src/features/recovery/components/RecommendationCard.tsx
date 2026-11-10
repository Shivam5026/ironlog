import { Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/utils";
import { recommendationTypeMeta } from "../utils/recovery-format";
import type { TodayRecommendation } from "../types/recovery.types";

interface RecommendationCardProps {
  recommendation: TodayRecommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const meta = recommendationTypeMeta[recommendation.type];
  const showsTargetMuscles =
    recommendation.type.startsWith("TRAIN_") &&
    recommendation.targetMuscles.length > 0;

  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Dumbbell className="size-4 text-primary" aria-hidden="true" />
          Today's Recommendation
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold leading-tight">{recommendation.title}</p>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white",
              meta.badge,
            )}
          >
            {meta.label}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {recommendation.reason}
        </p>

        {showsTargetMuscles && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {recommendation.targetMuscles.map((muscle) => (
              <span
                key={muscle}
                className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-foreground"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}