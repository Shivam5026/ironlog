import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Sheet, SheetContent, SheetTitle } from "@/shared/components/ui/Sheet";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { Separator } from "@/shared/components/ui/Separator";
import { Card, CardContent } from "@/shared/components/ui/Card";

import { useActiveWorkout } from "../hooks/useActiveWorkout";
import { useAutoSave } from "../hooks/useAutoSave";
import { useSessionStore } from "../store/session-store";
import { useTimerStore } from "../store/timer-store";
import { SessionHeader } from "../components/SessionHeader";
import { SessionFooter } from "../components/SessionFooter";
import { SessionStatistics } from "../components/SessionStatistics";
import { ActiveExercise } from "../components/ActiveExercise";
import { WorkoutProgress } from "../components/WorkoutProgress";
import { RecoveryBanner } from "../components/RecoveryBanner";
import {
  SESSION_KEY,
  readSessionSnapshot,
  readTimerSnapshot,
  readRestSnapshot,
  clearSessionSnapshotForTab,
} from "../utils/recovery-storage";

export default function LiveWorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isPending, isError, error, pause, resume, finish } = useActiveWorkout(sessionId!);
  const activeExerciseId = useSessionStore((state) => state.activeExerciseId);
  const setActiveExercise = useSessionStore((state) => state.setActiveExercise);
  const setLogs = useSessionStore((state) => state.setLogs);
  const [listOpen, setListOpen] = useState(false);
  const [isRecovered, setIsRecovered] = useState(() => {
    // A snapshot surviving only in localStorage means tab close/crash:
    // sessionStorage is refresh-only and gets cleared by hydration below.
    const snap = readSessionSnapshot();
    const inTab = sessionStorage.getItem(SESSION_KEY) !== null;
    return snap !== null && snap.id === sessionId && !inTab;
  });
  const hydratedRef = useRef(false);

  // Hydrate timers from a local snapshot (refresh / tab-close recovery)
  const hydrate = useTimerStore((state) => state.hydrate);
  const startWorkoutTimer = useTimerStore((state) => state.startWorkoutTimer);
  const pauseWorkoutTimer = useTimerStore((state) => state.pauseWorkoutTimer);
  const startRest = useTimerStore((state) => state.startRest);
  const stopRest = useTimerStore((state) => state.stopRest);
  useEffect(() => {
    if (hydratedRef.current || !session) return;
    hydratedRef.current = true;
    const timer = readTimerSnapshot();
    const rest = readRestSnapshot();
    hydrate(timer?.elapsedSeconds ?? 0, rest?.restRemaining ?? 0, timer?.running ?? false);
    if (timer?.running) {
      startWorkoutTimer();
    }
    if (rest && rest.restRemaining > 0) {
      startRest(rest.restRemaining);
    }
    if (timer || rest) {
      // Refresh case: the tab-scoped snapshot is consumed here; the
      // localStorage snapshot stays for tab-close crash recovery.
      clearSessionSnapshotForTab();
    }
  }, [session, hydrate, startWorkoutTimer, startRest]);

  // Persist session + timers to local storage on every change
  useAutoSave(sessionId ?? "");

  const logs = useMemo(() => session?.exerciseLogs ?? [], [session]);

  // Keep the store's exercise id list in sync so navigator can compute targets.
  useEffect(() => {
    setLogs(logs);
  }, [logs, setLogs]);

  // Keep the wall-clock workout timer in sync with the session status:
  // runs while ACTIVE, freezes while PAUSED.
  useEffect(() => {
    if (!session) return;
    if (session.status === "ACTIVE") {
      startWorkoutTimer();
    } else if (session.status === "PAUSED") {
      pauseWorkoutTimer();
    }
  }, [session?.status, startWorkoutTimer, pauseWorkoutTimer]);

  const currentIndex = useMemo(() => {
    if (!session || logs.length === 0) return -1;
    const index = logs.findIndex((log) => log.id === activeExerciseId);
    return index >= 0 ? index : 0;
  }, [session, logs, activeExerciseId]);

  const currentLog = currentIndex >= 0 ? logs[currentIndex] : null;

  if (!sessionId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load workout"
        description={error instanceof Error ? error.message : "Something went wrong."}
      />
    );
  }

  if (!session) {
    return (
      <ErrorState
        title="Workout not found"
        description="This workout session doesn't exist or may have ended."
      />
    );
  }

  const handleFinish = () => {
    finish.mutate(undefined, {
      onSuccess: () => {
        stopRest();
        useTimerStore.getState().pauseWorkoutTimer();
        navigate(`/dashboard/workout/${session.id}/summary`);
      },
    });
  };

  const anyPending = pause.isPending || resume.isPending || finish.isPending;

  const handleSkip = () => {
    if (currentIndex >= logs.length - 1) {
      handleFinish();
      return;
    }
    setActiveExercise(logs[currentIndex + 1].id);
  };

  const handleComplete = () => {
    if (currentIndex >= logs.length - 1) {
      handleFinish();
      return;
    }
    setActiveExercise(logs[currentIndex + 1].id);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {isRecovered && (
        <RecoveryBanner
          sessionId={session.id}
          onDismiss={() => setIsRecovered(false)}
        />
      )}

      <SessionHeader
        session={session}
        currentIndex={currentIndex}
        onOpenList={() => setListOpen(true)}
      />

      <SessionStatistics session={session} />

      <WorkoutProgress session={session} />

      <Separator />

      {logs.length === 0 ? (
        <p className="text-center text-muted-foreground">No exercises in this workout.</p>
      ) : (
        <ActiveExercise
          key={currentLog?.id}
          sessionId={session.id}
          log={currentLog!}
          isLast={currentIndex === logs.length - 1}
          isPending={finish.isPending}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onStartRest={startRest}
        />
      )}

      <SessionFooter
        status={session.status}
        isPending={anyPending}
        onPause={() => pause.mutate()}
        onResume={() => resume.mutate()}
        onFinish={handleFinish}
      />

      {/* Exercise list drawer */}
      <Sheet open={listOpen} onOpenChange={setListOpen}>
        <SheetContent side="right">
          <SheetTitle>Exercises</SheetTitle>
          <div className="space-y-2">
            {logs.map((log, index) => (
              <Card key={log.id} size="sm">
                <CardContent className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{log.exerciseName}</span>
                  <div className="flex items-center gap-2">
                    {log.sets.length > 0 && log.sets.every((set) => set.completed) ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Button
                      variant={index === currentIndex ? "default" : "outline"}
                      size="xs"
                      onClick={() => {
                        setActiveExercise(log.id);
                        setListOpen(false);
                      }}
                    >
                      {index === currentIndex ? "Current" : "Select"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
