import { create } from "zustand";

export type RecoveryState = {
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
};

type RecoveryStore = RecoveryState & {
  setSaving: (isSaving: boolean) => void;
  markSaved: () => void;
  markUnsaved: () => void;
};

export const useRecoveryStore = create<RecoveryStore>((set) => ({
  lastSavedAt: null,
  isSaving: false,
  hasUnsavedChanges: false,

  setSaving: (isSaving) => set({ isSaving }),
  markSaved: () =>
    set({ lastSavedAt: new Date(), isSaving: false, hasUnsavedChanges: false }),
  markUnsaved: () => set({ hasUnsavedChanges: true }),
}));
