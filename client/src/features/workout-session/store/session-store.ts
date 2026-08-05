import { create } from "zustand";

interface SessionStore {
  activeExerciseId: string | null;

  setActiveExercise: (exerciseId: string) => void;
  goToNextExercise: (currentIndex: number, total: number) => void;
  goToPreviousExercise: (currentIndex: number) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeExerciseId: null,

  setActiveExercise: (exerciseId) => set({ activeExerciseId: exerciseId }),

  goToNextExercise: (currentIndex, total) =>
    set((state) => {
      if (currentIndex < 0 || total === 0) return {};
      const nextIndex = Math.min(currentIndex + 1, total - 1);
      if (nextIndex === currentIndex) return {};
      return { activeExerciseId: null };
    }),

  goToPreviousExercise: (currentIndex) =>
    set((state) => {
      if (currentIndex <= 0) return {};
      return { activeExerciseId: null };
    }),
}));
