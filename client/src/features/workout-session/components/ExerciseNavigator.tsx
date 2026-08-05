import { ChevronLeft, ChevronRight, List } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { useSessionStore } from "../store/session-store";

interface ExerciseNavigatorProps {
  currentIndex: number;
  total: number;
  onOpenList: () => void;
}

export function ExerciseNavigator({ currentIndex, total, onOpenList }: ExerciseNavigatorProps) {
  const goToNextExercise = useSessionStore((state) => state.goToNextExercise);
  const goToPreviousExercise = useSessionStore((state) => state.goToPreviousExercise);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goToPreviousExercise(currentIndex)}
        disabled={currentIndex <= 0}
        aria-label="Previous exercise"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        {currentIndex + 1}/{total}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => goToNextExercise(currentIndex, total)}
        disabled={currentIndex >= total - 1}
        aria-label="Next exercise"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onOpenList} aria-label="Exercise list">
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
