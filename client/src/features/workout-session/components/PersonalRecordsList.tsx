import { Trophy } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { relativeTime } from "@/shared/lib/relativeTime";
import {
  formatVolume,
  formatWeight,
} from "@/features/workout-history/utils/format";

import type { PersonalRecord } from "../types/performance";

interface PersonalRecordsListProps {
  records: PersonalRecord[];
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function PersonalRecordsList({ records }: PersonalRecordsListProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {records.map((record) => (
        <Card key={record.exerciseId} className="border-amber-500/30">
          <CardContent className="space-y-3 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="font-medium leading-tight">
                  {record.exerciseName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {relativeTime(record.achievedAt)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric
                label="Best Weight"
                value={formatWeight(record.bestWeight)}
              />
              <Metric
                label="Best Volume"
                value={formatVolume(record.bestVolume)}
              />
              <Metric
                label="Est. 1RM"
                value={formatWeight(record.estimatedOneRepMax)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
