import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKey";
import type { WorkoutSessionSet } from "../types";

type SessionCache = { exerciseLogs: { id: string; sets: WorkoutSessionSet[] }[] };

function readSession(queryClient: QueryClient, sessionId: string) {
  return queryClient.getQueryData<SessionCache>([...queryKeys.workoutSessions, sessionId]);
}

function writeSession(queryClient: QueryClient, sessionId: string, session: SessionCache) {
  queryClient.setQueryData([...queryKeys.workoutSessions, sessionId], session);
}

/**
 * Merge a server set response into the session cache.
 *
 * `completed` is preserved from the cache unless overridden: an update PATCH
 * (weight/reps) racing a complete PATCH returns `completed: false` from the
 * pre-completion server state — replacing the whole set would flip the UI
 * back to incomplete. The complete mutation forces its own `completed` via
 * the override.
 */
export function patchSetInSession(
  queryClient: QueryClient,
  sessionId: string,
  set: WorkoutSessionSet,
  overrides: Partial<WorkoutSessionSet> = {},
) {
  const session = readSession(queryClient, sessionId);
  if (!session) return;

  writeSession(queryClient, sessionId, {
    ...session,
    exerciseLogs: session.exerciseLogs.map((log) =>
      log.id === set.exerciseLogId
        ? {
            ...log,
            sets: log.sets
              .map((s) =>
                s.id === set.id
                  ? { ...s, ...set, completed: overrides.completed ?? s.completed }
                  : s,
              )
              .sort((a, b) => a.setNumber - b.setNumber),
          }
        : log,
    ),
  });
}

export function addSetToSession(
  queryClient: QueryClient,
  sessionId: string,
  set: WorkoutSessionSet,
) {
  const session = readSession(queryClient, sessionId);
  if (!session) return;

  writeSession(queryClient, sessionId, {
    ...session,
    exerciseLogs: session.exerciseLogs.map((log) =>
      log.id === set.exerciseLogId
        ? { ...log, sets: [...log.sets, set].sort((a, b) => a.setNumber - b.setNumber) }
        : log,
    ),
  });
}

export function removeSetFromSession(
  queryClient: QueryClient,
  sessionId: string,
  exerciseLogId: string,
  setId: string,
) {
  const session = readSession(queryClient, sessionId);
  if (!session) return;

  writeSession(queryClient, sessionId, {
    ...session,
    exerciseLogs: session.exerciseLogs.map((log) =>
      log.id === exerciseLogId ? { ...log, sets: log.sets.filter((s) => s.id !== setId) } : log,
    ),
  });
}

export function replaceSetsInSession(
  queryClient: QueryClient,
  sessionId: string,
  exerciseLogId: string,
  sets: WorkoutSessionSet[],
) {
  const session = readSession(queryClient, sessionId);
  if (!session) return;

  writeSession(queryClient, sessionId, {
    ...session,
    exerciseLogs: session.exerciseLogs.map((log) =>
      log.id === exerciseLogId ? { ...log, sets } : log,
    ),
  });
}
