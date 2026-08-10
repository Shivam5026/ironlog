import type { WorkoutSession } from "../types";

export const SESSION_KEY = "ironlog:active-session";
const TIMER_KEY = "ironlog:active-timer";
const REST_KEY = "ironlog:active-rest";

type TimerSnapshot = {
  elapsedSeconds: number;
  running: boolean;
  savedAt: string;
};

type RestSnapshot = {
  restRemaining: number;
  restStartedAt: string | null;
};

export function writeSessionSnapshot(session: WorkoutSession) {
  try {
    const snapshot = { session, savedAt: new Date().toISOString() };

    // sessionStorage survives refreshes; localStorage survives tab close / crash
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
    localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // storage full or blocked; recovery still works server-side
  }
}

export function readSessionSnapshot(): WorkoutSession | null {
  try {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { session: WorkoutSession; savedAt: string };
    return parsed.session ?? null;
  } catch {
    return null;
  }
}

export function clearSessionSnapshot() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}

/** Refresh-only cleanup: drop the tab-scoped snapshot, keep the crash snapshot. */
export function clearSessionSnapshotForTab() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}

export function writeTimerSnapshot(elapsedSeconds: number, running: boolean) {
  try {
    localStorage.setItem(
      TIMER_KEY,
      JSON.stringify({ elapsedSeconds, running, savedAt: new Date().toISOString() }),
    );
  } catch {
    // no-op
  }
}

export function readTimerSnapshot(): TimerSnapshot | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TimerSnapshot;
  } catch {
    return null;
  }
}

export function clearTimerSnapshot() {
  try {
    localStorage.removeItem(TIMER_KEY);
  } catch {
    // no-op
  }
}

export function writeRestSnapshot(restRemaining: number, restStartedAt: string | null) {
  try {
    if (restRemaining <= 0) {
      localStorage.removeItem(REST_KEY);
      return;
    }
    localStorage.setItem(
      REST_KEY,
      JSON.stringify({ restRemaining, restStartedAt } satisfies RestSnapshot),
    );
  } catch {
    // no-op
  }
}

export function readRestSnapshot(): RestSnapshot | null {
  try {
    const raw = localStorage.getItem(REST_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RestSnapshot;
  } catch {
    return null;
  }
}

export function clearRestSnapshot() {
  try {
    localStorage.removeItem(REST_KEY);
  } catch {
    // no-op
  }
}
