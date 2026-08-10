import { create } from "zustand";

type TimerHandle = ReturnType<typeof setInterval>;

interface TimerStore {
  workoutElapsed: number;
  workoutRunning: boolean;
  workoutInterval: TimerHandle | null;

  restRemaining: number;
  restInterval: TimerHandle | null;

  startWorkoutTimer: () => void;
  pauseWorkoutTimer: () => void;
  resumeWorkoutTimer: () => void;
  resetWorkoutTimer: () => void;

  startRest: (seconds: number) => void;
  stopRest: () => void;

  hydrate: (workoutElapsed: number, restRemaining: number, workoutRunning: boolean) => void;
}

function clearHandle(handle: TimerHandle | null) {
  if (handle) clearInterval(handle);
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  workoutElapsed: 0,
  workoutRunning: false,
  workoutInterval: null,

  restRemaining: 0,
  restInterval: null,

  startWorkoutTimer: () => {
    if (get().workoutInterval) return;
    const startedAt = Date.now() - get().workoutElapsed * 1000;
    const interval = setInterval(() => {
      set({ workoutElapsed: Math.floor((Date.now() - startedAt) / 1000) });
    }, 1000);
    set({ workoutInterval: interval, workoutRunning: true });
  },

  pauseWorkoutTimer: () => {
    clearHandle(get().workoutInterval);
    set({ workoutInterval: null, workoutRunning: false });
  },

  resumeWorkoutTimer: () => {
    if (get().workoutInterval) return;
    const startedAt = Date.now() - get().workoutElapsed * 1000;
    const interval = setInterval(() => {
      set({ workoutElapsed: Math.floor((Date.now() - startedAt) / 1000) });
    }, 1000);
    set({ workoutInterval: interval, workoutRunning: true });
  },

  resetWorkoutTimer: () => {
    clearHandle(get().workoutInterval);
    set({ workoutElapsed: 0, workoutRunning: false, workoutInterval: null });
  },

  startRest: (seconds) => {
    clearHandle(get().restInterval);
    const endsAt = Date.now() + seconds * 1000;
    set({ restRemaining: seconds });
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (remaining <= 0) {
        clearHandle(interval);
        set({ restRemaining: 0, restInterval: null });
        return;
      }
      set({ restRemaining: remaining });
    }, 250);
    set({ restInterval: interval });
  },

  stopRest: () => {
    clearHandle(get().restInterval);
    set({ restRemaining: 0, restInterval: null });
  },

  hydrate: (workoutElapsed, restRemaining, workoutRunning) => {
    clearHandle(get().workoutInterval);
    clearHandle(get().restInterval);
    set({
      workoutElapsed,
      restRemaining,
      workoutRunning,
      workoutInterval: null,
      restInterval: null,
    });
  },
}));
