import { create } from "zustand";

interface SessionStore {
  activeExerciseId: string | null;
  logs: { id: string }[];

  setActiveExercise: (exerciseId: string) => void;
  setLogs: (logs: { id: string }[]) => void;
  goToNextExercise: (currentIndex: number, total: number) => void;
  goToPreviousExercise: (currentIndex: number) => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  activeExerciseId: null,
  logs: [],

  setActiveExercise: (exerciseId) => set({ activeExerciseId: exerciseId }),
  setLogs: (logs) => set({ logs }),

  goToNextExercise: (currentIndex, total) => {
    if (currentIndex < 0 || total === 0) return;
    const nextIndex = Math.min(currentIndex + 1, total - 1);
    if (nextIndex === currentIndex) return;
    const logs = get().logs;
    const nextId = logs[nextIndex]?.id ?? null;
    set({ activeExerciseId: nextId });
  },

  goToPreviousExercise: (currentIndex) => {
    if (currentIndex <= 0) return;
    const logs = get().logs;
    const prevId = logs[currentIndex - 1]?.id ?? null;
    set({ activeExerciseId: prevId });
  },
}));
