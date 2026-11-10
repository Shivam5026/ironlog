import { create } from "zustand";

/**
 * Client-side preference for which muscle group the Recovery Dashboard
 * highlights on the muscle recovery card. This is a view preference only —
 * recovery data itself stays in TanStack Query.
 */

type SelectedMuscleStore = {
  selectedMuscle: string | null;
  selectMuscle: (muscle: string) => void;
  clearSelection: () => void;
};

export const useSelectedMuscleStore = create<SelectedMuscleStore>((set) => ({
  selectedMuscle: null,
  selectMuscle: (muscle) => set({ selectedMuscle: muscle }),
  clearSelection: () => set({ selectedMuscle: null }),
}));