import { Check, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

interface SetActionsProps {
  completed: boolean;
  isFirst: boolean;
  isLast: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isPending?: boolean;
  onToggleComplete: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SetActions({
  completed,
  isFirst,
  isLast,
  canMoveUp,
  canMoveDown,
  isPending,
  onToggleComplete,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SetActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onMoveUp}
        disabled={isFirst || !canMoveUp || isPending}
        aria-label="Move set up"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onMoveDown}
        disabled={isLast || !canMoveDown || isPending}
        aria-label="Move set down"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant={completed ? "default" : "outline"}
        size="icon-sm"
        onClick={onToggleComplete}
        disabled={isPending}
        aria-label={completed ? "Mark set incomplete" : "Mark set complete"}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        disabled={isPending}
        aria-label="Delete set"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
