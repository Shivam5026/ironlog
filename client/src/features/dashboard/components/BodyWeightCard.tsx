import { Scale } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { formatDate, formatWeight } from "../utils/format";
import type { DashboardCurrentWeight } from "../types/dashboard.types";

interface BodyWeightCardProps {
  weight: DashboardCurrentWeight | null;
}

export function BodyWeightCard({ weight }: BodyWeightCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Scale className="size-4 text-primary" />
          Current Bodyweight
        </div>

        {weight ? (
          <div className="mt-3">
            <p className="text-xl font-bold">{formatWeight(weight.weight)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recorded {formatDate(weight.recordedAt)}
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-xl font-bold">Not recorded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your weight to start tracking it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}