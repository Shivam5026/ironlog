import { useMemo, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, Circle, List } from "lucide-react";

import { Button } from "@/shared/components/ui/Button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/shared/components/ui/Sheet";
import { ErrorState } from "@/shared/components/ui/ErrorState";
import { Separator } from "@/shared/components/ui/Separator";
import { Card, CardContent } from "@/shared/components/ui/Card";

import { useActiveWorkout } from "../hooks/useActiveWorkout";
import { useRestTimer } from "../hooks/useRestTimer";
import { useSessionStore } from "../store/session-store";
import { SessionHeader } from "../components/SessionHeader";
import { SessionFooter } from "../components/SessionFooter";
import { SessionStatistics } from "../components/SessionStatistics";
import { ActiveExercise } from "../components/ActiveExercise";
import { WorkoutProgress } from "../components/WorkoutProgress";

export default function LiveWorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: session, isPending, isError, error, pause, resume, finish } = useActiveWorkout(sessionId!);
  const { startRest } = useRestTimer();
  const activeExerciseId = useSessionStore((state) => state.activeExerciseId);
  const setActiveExercise = useSessionStore((state) => state.setActiveExercise);
  const [listOpen, setListOpen] = useState(false);

  const logs = session?.exerciseLogs ?? [];

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
      onSuccess: () => navigate("/dashboard"),
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
          onStartRest={(set) => startRest(set.restTime)}
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
