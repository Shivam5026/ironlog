import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { ExerciseCompletedIndicator } from "./ExerciseCompletedIndicator";
import type { ExerciseLog } from "../types";

interface ExerciseProgressCardProps {
  log: ExerciseLog;
  active: boolean;
  onSelect: () => void;
  completed: boolean;
}

export function ExerciseProgressCard({ log, active, onSelect, completed }: ExerciseProgressCardProps) {
  const doneSets = log.sets.filter((set) => set.completed).length;

  return (
    <Card size="sm" data-active={active ? "" : undefined}>
      <CardHeader>
        <CardTitle>{log.exerciseName}</CardTitle>
        {completed && (
          <CardAction>
            <ExerciseCompletedIndicator completed />
          </CardAction>
        )}
        <CardDescription>
          {doneSets}/{log.sets.length} sets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={active ? "default" : "outline"} size="sm" onClick={onSelect}>
          {active ? "Logging" : "Log"}
        </Button>
      </CardContent>
    </Card>
  );
}
