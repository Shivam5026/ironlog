import { useEffect } from "react";
import { useTimerStore } from "../store/timer-store";

export function useWorkoutTimer() {
  const elapsedSeconds = useTimerStore((state) => state.workoutElapsed);
  const isRunning = useTimerStore((state) => state.workoutRunning);
  const start = useTimerStore((state) => state.startWorkoutTimer);
  const pause = useTimerStore((state) => state.pauseWorkoutTimer);
  const resume = useTimerStore((state) => state.resumeWorkoutTimer);
  const reset = useTimerStore((state) => state.resetWorkoutTimer);

  // keep the clock alive on unmount; no auto-cleanup so the workout
  // survives navigation while the session is still active
  useEffect(() => {
    return () => {};
  }, []);

  return { elapsedSeconds, isRunning, start, pause, resume, reset };
}
