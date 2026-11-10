import { Timer } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { formatRecoveryDuration } from "../utils/recovery-format";

interface AverageRecoveryTimeCardProps {
  averageRecoveryHours: number | null;
  observedRecoveryHours: number | null;
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/**
 * Average recovery time (Feature 7.1).
 *
 * Contrasts the model-estimated duration (the configured per-muscle recovery
 * the engine assumes) with the observed duration (time actually elapsed between
 * repeated trainings of the same muscle). A missing measurement renders as an
 * em dash rather than a fabricated zero.
 */
export function AverageRecoveryTimeCard({
  averageRecoveryHours,
  observedRecoveryHours,
}: AverageRecoveryTimeCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Average Recovery Time
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Metric
          label="Model estimate"
          value={formatRecoveryDuration(averageRecoveryHours)}
          hint="Configured recovery time per trained muscle"
        />
        <Metric
          label="Observed"
          value={formatRecoveryDuration(observedRecoveryHours)}
          hint="Actual gap between repeat trainings of a muscle"
        />
      </CardContent>
    </Card>
  );
}
