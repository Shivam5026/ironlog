import { Trophy } from "lucide-react";

import {
  formatVolume,
  formatWeight,
} from "@/features/workout-history/utils/format";

import type {
  NewPersonalRecord,
  PersonalRecordMetric,
} from "../types/performance";

const METRIC_LABELS: Record<PersonalRecordMetric, string> = {
  WEIGHT: "Highest Weight",
  VOLUME: "Highest Volume",
  ONE_REP_MAX: "Estimated 1RM",
};

function formatValue(record: NewPersonalRecord): string {
  return record.type === "VOLUME"
    ? formatVolume(record.value)
    : formatWeight(record.value);
}

export function NewPersonalRecordToast({
  record,
}: {
  record: NewPersonalRecord;
}) {
  return (
    <div className="flex w-full items-start gap-3 rounded-xl border border-amber-500/40 bg-popover p-4 text-popover-foreground shadow-lg">
      <div className="rounded-full bg-amber-500/15 p-2">
        <Trophy className="h-4 w-4 text-amber-500" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
          🏆 New Personal Record!
        </p>
        <p className="truncate text-sm font-medium">{record.exerciseName}</p>
        <p className="text-xs text-muted-foreground">
          {METRIC_LABELS[record.type]}:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {formatValue(record)}
          </span>
        </p>
      </div>
    </div>
  );
}
