import { Badge } from "@/shared/components/ui/Badge";
import { WorkoutTimer } from "./WorkoutTimer";
import { ExerciseNavigator } from "./ExerciseNavigator";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { useRecoveryStore } from "../store/recovery-store";
import type { WorkoutSession } from "../types";

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

interface SessionHeaderProps {
  session: WorkoutSession;
  currentIndex: number;
  onOpenList: () => void;
}

export function SessionHeader({ session, currentIndex, onOpenList }: SessionHeaderProps) {
  const lastSavedAt = useRecoveryStore((state) => state.lastSavedAt);
  const isSaving = useRecoveryStore((state) => state.isSaving);
  const hasUnsavedChanges = useRecoveryStore((state) => state.hasUnsavedChanges);

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{session.workoutPlan.name}</h1>
        <p className="text-sm text-muted-foreground">
          Started {new Date(session.startedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <WorkoutTimer />
        <ExerciseNavigator
          currentIndex={currentIndex}
          total={session.exerciseLogs.length}
          onOpenList={onOpenList}
        />
        <Badge variant={session.status === "ACTIVE" ? "default" : "secondary"}>
          {statusLabel[session.status] ?? session.status}
        </Badge>
        <AutoSaveIndicator
          lastSavedAt={lastSavedAt}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>
    </header>
  );
}
