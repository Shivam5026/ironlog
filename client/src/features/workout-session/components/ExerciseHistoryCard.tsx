import { Loader2, BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
import { useExerciseHistory } from "../hooks/usePerformance";

interface ExerciseHistoryCardProps {
  exerciseId: string;
}

export function ExerciseHistoryCard({ exerciseId }: ExerciseHistoryCardProps) {
  const { data: history, isPending, isError } = useExerciseHistory(exerciseId, 10);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <BarChart3 className="h-4 w-4" />
          Recent History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : isError || !history || history.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No history yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.workoutSessionId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {new Date(entry.startedAt).toLocaleDateString()}
                </span>
                <span className="tabular-nums">
                  {entry.bestWeight} × {entry.bestReps}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {entry.totalVolume} kg · {entry.totalSets} sets
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
