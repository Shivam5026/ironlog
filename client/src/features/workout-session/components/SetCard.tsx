import { Card, CardContent } from "@/shared/components/ui/Card";
import { CompletedBadge } from "./CompletedBadge";
import { SetEditor } from "./SetEditor";
import { SetActions } from "./SetActions";
import type { WorkoutSessionSet } from "../types";

interface SetCardProps {
  set: WorkoutSessionSet;
  index: number;
  total: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isPending?: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onWeightCommit: (weight: number) => void;
  onRepsCommit: (reps: number) => void;
}

export function SetCard({
  set,
  index,
  total,
  canMoveUp,
  canMoveDown,
  isPending,
  onToggleComplete,
  onDelete,
  onMoveUp,
  onMoveDown,
  onWeightCommit,
  onRepsCommit,
}: SetCardProps) {
  return (
    <Card size="sm" className={set.completed ? "opacity-70" : undefined}>
      <CardContent className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CompletedBadge completed={set.completed} />
          <span className="w-14 shrink-0 text-sm font-medium">
            Set {index + 1}
            <span className="block text-xs font-normal text-muted-foreground">/ {total}</span>
          </span>
        </div>

        <SetEditor
          weight={Number(set.weight)}
          reps={set.reps}
          disabled={isPending}
          onWeightCommit={onWeightCommit}
          onRepsCommit={onRepsCommit}
        />

        <SetActions
          completed={set.completed}
          isFirst={index === 0}
          isLast={index === total - 1}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          isPending={isPending}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      </CardContent>
    </Card>
  );
}
