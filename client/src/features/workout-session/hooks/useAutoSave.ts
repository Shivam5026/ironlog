import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import { useRecoveryStore } from "../store/recovery-store";
import {
  writeSessionSnapshot,
  writeTimerSnapshot,
  writeRestSnapshot,
} from "../utils/recovery-storage";
import { useTimerStore } from "../store/timer-store";
import type { WorkoutSession } from "../types";

function takeTimers() {
  const state = useTimerStore.getState();
  const restInterval = state.restInterval;
  return {
    workoutElapsed: state.workoutElapsed,
    workoutRunning: state.workoutRunning,
    restRemaining: state.restRemaining,
    restStartedAt: restInterval ? new Date().toISOString() : null,
  };
}

function persist(session: WorkoutSession) {
  writeSessionSnapshot(session);
  const timers = takeTimers();
  writeTimerSnapshot(timers.workoutElapsed, timers.workoutRunning);
  writeRestSnapshot(timers.restRemaining, timers.restStartedAt);
}

export function useAutoSave(sessionId: string) {
  const enabled = sessionId.length > 0;
  const queryClient = useQueryClient();
  const markUnsaved = useRecoveryStore((state) => state.markUnsaved);
  const setSaving = useRecoveryStore((state) => state.setSaving);
  const markSaved = useRecoveryStore((state) => state.markSaved);

  const sessionRef = useRef<WorkoutSession | null>(null);
  const flushTimer = useRef<number | null>(null);
  const lastKeyRef = useRef<string>("");

  // Interval backup for safety
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      const session = sessionRef.current;
      if (!session || (session.status !== "ACTIVE" && session.status !== "PAUSED")) return;
      persist(session);
      markSaved();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [markSaved, enabled]);

  // Persist immediately (debounced) whenever the session in the query cache changes.
  useEffect(() => {
    if (!enabled) return;
    const queryKey = [...queryKeys.workoutSessions, sessionId];

    const flush = () => {
      const session = sessionRef.current;
      if (!session || (session.status !== "ACTIVE" && session.status !== "PAUSED")) return;
      persist(session);
      markSaved();
    };

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated") return;
      const session = queryClient.getQueryData<WorkoutSession>(queryKey);
      if (!session || session.id !== sessionId) return;

      sessionRef.current = session;

      const key = JSON.stringify(session);
      if (key === lastKeyRef.current) return;
      lastKeyRef.current = key;

      markUnsaved();
      setSaving(true);

      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      flushTimer.current = window.setTimeout(flush, 200);
    });

    return () => {
      if (flushTimer.current) window.clearTimeout(flushTimer.current);
      unsubscribe();
    };
  }, [queryClient, sessionId, markUnsaved, setSaving, markSaved, enabled]);

  // Flush on tab close / refresh
  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      const session = sessionRef.current;
      if (!session || (session.status !== "ACTIVE" && session.status !== "PAUSED")) return;
      persist(session);
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [enabled]);

  return { hasUnsavedChanges: useRecoveryStore((s) => s.hasUnsavedChanges) };
}