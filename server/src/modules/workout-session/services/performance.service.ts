import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import type {
  ExerciseHistoryEntry,
  PersonalRecord,
  PreviousPerformance,
} from "../types/performance.types";

export function epleyOneRepMax(weight: number, reps: number): number | null {
  if (reps <= 0) return null;
  return Math.round(weight * (1 + reps / 30));
}

type LogWithSets = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  workoutSession: {
    id: string;
    startedAt: Date;
    status: string;
  };
  sets: {
    weight: { toString(): string };
    reps: number;
    completed: boolean;
  }[];
};

async function getCompletedLogs(userId: string, exerciseId?: string) {
  return prisma.exerciseLog.findMany({
    where: {
      exerciseId,
      workoutSession: {
        userId,
        status: { in: ["COMPLETED", "ABANDONED"] },
      },
    },
    include: {
      workoutSession: { select: { id: true, startedAt: true, status: true } },
      sets: true,
    },
    orderBy: { workoutSession: { startedAt: "desc" } },
  }) as Promise<LogWithSets[]>;
}

function bestSet(
  sets: LogWithSets["sets"],
): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  // "best" = heaviest completed set, ties broken by more reps
  for (const set of sets) {
    if (!set.completed) continue;
    const weight = Number(set.weight);
    if (
      best === null ||
      weight > best.weight ||
      (weight === best.weight && set.reps > best.reps)
    ) {
      best = { weight, reps: set.reps };
    }
  }
  return best;
}

async function getPreviousPerformance(userId: string, exerciseId: string) {
  const logs = await getCompletedLogs(userId, exerciseId);

  if (logs.length === 0) {
    return null;
  }

  const [latest, ...rest] = logs;
  const best = logs
    .map((log) => bestSet(log.sets))
    .filter((set): set is { weight: number; reps: number } => set !== null)
    .reduce<{ weight: number; reps: number } | null>(
      (acc, set) =>
        acc === null ||
        set.weight > acc.weight ||
        (set.weight === acc.weight && set.reps > acc.reps)
          ? set
          : acc,
      null,
    );

  const latestBest = bestSet(latest.sets);

  const result: PreviousPerformance = {
    exerciseId,
    bestWeight: best?.weight ?? 0,
    bestReps: best?.reps ?? 0,
    lastWeight: latestBest?.weight ?? 0,
    lastReps: latestBest?.reps ?? 0,
    estimatedOneRepMax:
      best?.weight !== undefined
        ? epleyOneRepMax(best.weight, best.reps)
        : null,
  };

  return result;
}

async function getPersonalRecords(userId: string) {
  const logs = await getCompletedLogs(userId);

  const byExercise = new Map<string, { logs: LogWithSets[]; name: string }>();

  for (const log of logs) {
    const entry = byExercise.get(log.exerciseId);
    if (entry) {
      entry.logs.push(log);
    } else {
      byExercise.set(log.exerciseId, { logs: [log], name: log.exerciseName });
    }
  }

  const records: PersonalRecord[] = [];

  for (const [exerciseId, { logs, name }] of byExercise) {
    const best = logs
      .map((log) => bestSet(log.sets))
      .filter(Boolean)
      .sort(
        (a, b) =>
          (b?.weight ?? 0) - (a?.weight ?? 0) ||
          (b?.reps ?? 0) - (a?.reps ?? 0),
      )[0];

    if (!best) continue;

    const lastLog = logs[logs.length - 1];

    records.push({
      exerciseId,
      exerciseName: name,
      bestWeight: best.weight,
      bestReps: best.reps,
      estimatedOneRepMax: epleyOneRepMax(best.weight, best.reps),
      lastPerformedAt: lastLog.workoutSession.startedAt,
      workoutSessionId: lastLog.workoutSession.id,
    });
  }

  records.sort((a, b) => b.lastPerformedAt.getTime() - a.lastPerformedAt.getTime());

  return records;
}

async function getExerciseHistory(userId: string, exerciseId: string, limit: number) {
  const logs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId,
      workoutSession: {
        userId,
        status: { in: ["COMPLETED", "ABANDONED"] },
      },
    },
    include: {
      workoutSession: { select: { id: true, startedAt: true } },
      sets: true,
    },
    orderBy: { workoutSession: { startedAt: "desc" } },
    take: limit,
  });

  const grouped = new Map<string, (typeof logs)[number]>();

  for (const log of logs) {
    if (!grouped.has(log.workoutSession.id)) {
      grouped.set(log.workoutSession.id, log);
    }
  }

  const entries: ExerciseHistoryEntry[] = [];
  for (const log of grouped.values()) {
    const best = bestSet(log.sets);
    const completedSets = log.sets.filter((set) => set.completed);

    entries.push({
      workoutSessionId: log.workoutSession.id,
      startedAt: log.workoutSession.startedAt,
      bestWeight: best?.weight ?? 0,
      bestReps: best?.reps ?? 0,
      totalVolume: completedSets.reduce((sum, set) => sum + Number(set.weight) * set.reps, 0),
      totalSets: completedSets.length,
    });
  }

  entries.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  return entries;
}

export const performanceService = {
  getPreviousPerformance,
  getPersonalRecords,
  getExerciseHistory,
};