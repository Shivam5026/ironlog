import { Trophy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/Card";
import type { PersonalRecordEntry } from "../types/workout-summary";

interface PersonalRecordsCardProps {
  records: PersonalRecordEntry[];
}

export function PersonalRecordsCard({ records }: PersonalRecordsCardProps) {
  if (records.length === 0) return null;

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-amber-500" />
          Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {records.map((record) => (
          <div
            key={record.exerciseId}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div>
              <p className="font-medium">{record.exerciseName}</p>
              <p className="text-xs text-muted-foreground">
                Previous best: {record.previousBestWeight} × {record.previousBestReps}
              </p>
            </div>
            <p className="tabular-nums font-semibold text-amber-600">
              {record.weight} × {record.reps}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}