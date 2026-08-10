import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/shared/components/ui/Sheet";
import { Button } from "@/shared/components/ui/Button";
import { useRecovery } from "../hooks/useRecovery";
import { useSessionStore } from "../store/session-store";
import { useTimerStore } from "../store/timer-store";
import { clearSessionSnapshot, clearTimerSnapshot, clearRestSnapshot } from "../utils/recovery-storage";

interface RecoveryDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecoveryDialog({ sessionId, open, onOpenChange }: RecoveryDialogProps) {
  const navigate = useNavigate();
  const { recover, clear, isPending } = useRecovery();

  const handleRecover = () => {
    recover.mutate(sessionId, {
      onSuccess: () => {
        onOpenChange(false);
        navigate(`/dashboard/workout/${sessionId}`);
      },
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
        onOpenChange(false);
        navigate("/dashboard");
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-w-md mx-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Resume your workout?</SheetTitle>
          <SheetDescription>
            You have an unfinished workout. Resume where you left off, or discard it.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button variant="outline" onClick={handleDiscard} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Discard
          </Button>
          <Button onClick={handleRecover} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Resume workout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
