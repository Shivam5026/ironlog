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
    const interval = setInterval(() => {
      set((state) => ({ workoutElapsed: state.workoutElapsed + 1 }));
    }, 1000);
    set({ workoutInterval: interval, workoutRunning: true });
  },

  pauseWorkoutTimer: () => {
    clearHandle(get().workoutInterval);
    set({ workoutInterval: null, workoutRunning: false });
  },

  resumeWorkoutTimer: () => {
    if (get().workoutInterval) return;
    const interval = setInterval(() => {
      set((state) => ({ workoutElapsed: state.workoutElapsed + 1 }));
    }, 1000);
    set({ workoutInterval: interval, workoutRunning: true });
  },

  resetWorkoutTimer: () => {
    clearHandle(get().workoutInterval);
    set({ workoutElapsed: 0, workoutRunning: false, workoutInterval: null });
  },

  startRest: (seconds) => {
    clearHandle(get().restInterval);
    set({ restRemaining: seconds });
    const interval = setInterval(() => {
      set((state) => {
        if (state.restRemaining <= 1) {
          clearHandle(interval);
          return { restRemaining: 0, restInterval: null };
        }
        return { restRemaining: state.restRemaining - 1 };
      });
    }, 1000);
    set({ restInterval: interval });
  },

  stopRest: () => {
    clearHandle(get().restInterval);
    set({ restRemaining: 0, restInterval: null });
  },
}));
