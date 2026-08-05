import { useTimerStore } from "../store/timer-store";

export function useRestTimer() {
  const remainingTime = useTimerStore((state) => state.restRemaining);
  const startRest = useTimerStore((state) => state.startRest);
  const stopRest = useTimerStore((state) => state.stopRest);

  return { remainingTime, startRest, stopRest };
}
