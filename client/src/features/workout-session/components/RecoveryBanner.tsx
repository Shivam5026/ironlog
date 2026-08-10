import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { useRecovery } from "../hooks/useRecovery";
import { useSessionStore } from "../store/session-store";
import { useTimerStore } from "../store/timer-store";
import { clearSessionSnapshot, clearTimerSnapshot, clearRestSnapshot } from "../utils/recovery-storage";

interface RecoveryBannerProps {
  sessionId: string;
  onDismiss: () => void;
}

export function RecoveryBanner({ sessionId, onDismiss }: RecoveryBannerProps) {
  const navigate = useNavigate();
  const { recover, clear, isPending } = useRecovery();

  const handleRecover = () => {
    recover.mutate(sessionId, {
      onSuccess: () => navigate(`/dashboard/workout/${sessionId}`),
    });
  };

  const handleDiscard = () => {
    clear.mutate(sessionId, {
      onSuccess: () => {
        clearSessionSnapshot();
        clearTimerSnapshot();
        clearRestSnapshot();
        useTimerStore.getState().resetWorkoutTimer();
        useSessionStore.getState().setActiveExercise("");
        onDismiss();
      },
    });
  };

  return (
    <Card className="border-amber-500/40 bg-amber-500/5">
      <CardContent className="flex items-center justify-between gap-3 py-3">
        <p className="text-sm">
          <span className="font-medium">Recovered workout.</span>{" "}
          <span className="text-muted-foreground">Resume or discard it.</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDiscard} disabled={isPending}>
            Discard
          </Button>
          <Button size="sm" onClick={handleRecover} disabled={isPending}>
            Resume
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Dismiss">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}