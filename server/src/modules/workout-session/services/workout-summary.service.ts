import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { timerService } from "./timer.service";
import { SESSION_INCLUDE } from "./workout-session.service";
import type { PersonalRecordEntry, WorkoutSummary, WorkoutSummaryExercise } from "../types/workout-summary.types";

type LogWithSets = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  notes: string | null;
  sets: {
    setNumber: number;
    weight: { toString(): string };
    reps: number;
    completed: boolean;
  }[];
};

function bestSet(
  sets: LogWithSets["sets"],
): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  for (const set of sets) {
    if (!set.completed) continue;
    const weight = Number(set.weight);
    if (best === null || weight > best.weight || (weight === best.weight && set.reps > best.reps)) {
      best = { weight, reps: set.reps };
    }
  }
  return best;
}

export function calculateDuration(startedAt: Date, endedAt: Date): number {
  return Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
}

export function calculateTotalVolume(logs: LogWithSets[]): number {
  return logs
    .flatMap((log) => log.sets)
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + Number(set.weight) * set.reps, 0);
}

export function calculateTotalReps(logs: LogWithSets[]): number {
  return logs
    .flatMap((log) => log.sets)
    .filter((set) => set.completed)
    .reduce((sum, set) => sum + set.reps, 0);
}

/** Rough calorie burn: MET-scaled by duration/bodyweight + small per-set component. */
export function estimateCalories(
  bodyWeightKg: number,
  durationSeconds: number,
  completedSets: number,
): number {
  const minutes = durationSeconds / 60;
  return Math.round(0.0175 * 60 * bodyWeightKg * (minutes / 60) * 4 + completedSets * 1.5);
}

export function calculateWorkoutSummary(
  session: {
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    duration: number | null;
    logs: LogWithSets[];
  },
  personalRecords: PersonalRecordEntry[] = [],
  estimatedCalories = 0,
): WorkoutSummary {
  const logs = session.logs;
  const totalSets = logs.reduce((sum, log) => sum + log.sets.length, 0);
  const completedSets = logs.reduce(
    (sum, log) => sum + log.sets.filter((set) => set.completed).length,
    0,
  );
  const completedExercises = logs.filter(
    (log) => log.sets.length > 0 && log.sets.every((set) => set.completed),
  ).length;
  const totalVolume = calculateTotalVolume(logs);
  const totalReps = calculateTotalReps(logs);
  const endedAt = session.endedAt ?? new Date();
  const duration = session.duration ?? calculateDuration(session.startedAt, endedAt);

  const exercises: WorkoutSummaryExercise[] = logs.map((log) => {
    const best = bestSet(log.sets);
    const completedLogSets = log.sets.filter((set) => set.completed);
    return {
      exerciseId: log.exerciseId,
      exerciseName: log.exerciseName,
      bestWeight: best?.weight ?? 0,
      bestReps: best?.reps ?? 0,
      totalVolume: completedLogSets.reduce((s, set) => s + Number(set.weight) * set.reps, 0),
      completedSets: completedLogSets.length,
    };
  });

  return {
    sessionId: session.id,
    duration,
    totalExercises: logs.length,
    completedExercises,
    totalSets,
    completedSets,
    totalReps,
    totalVolume,
    personalRecords,
    estimatedCalories,
    startedAt: session.startedAt,
    endedAt,
    exercises,
  };
}

/**
 * Compare each exercise's best set against the all-time best BEFORE this session.
 * A heavier top set (or equal weight with more reps) is a personal record.
 */
export async function detectPersonalRecords(
  userId: string,
  sessionId: string,
  startedAt: Date,
  logs: LogWithSets[],
): Promise<PersonalRecordEntry[]> {
  const exerciseIds = [...new Set(logs.map((log) => log.exerciseId))];
  if (exerciseIds.length === 0) return [];

  const priorLogs = await prisma.exerciseLog.findMany({
    where: {
      exerciseId: { in: exerciseIds },
      workoutSession: {
        userId,
        status: "COMPLETED",
        id: { not: sessionId },
        startedAt: { lt: startedAt },
      },
    },
    include: { sets: true },
  });

  const priorBestByExercise = new Map<string, { weight: number; reps: number }>();

  for (const prior of priorLogs) {
    const best = bestSet(prior.sets);
    if (!best) continue;
    const current = priorBestByExercise.get(prior.exerciseId);
    if (
      !current ||
      best.weight > current.weight ||
      (best.weight === current.weight && best.reps > current.reps)
    ) {
      priorBestByExercise.set(prior.exerciseId, best);
    }
  }

  const records: PersonalRecordEntry[] = [];

  for (const log of logs) {
    const best = bestSet(log.sets);
    if (!best) continue;

    const prior = priorBestByExercise.get(log.exerciseId) ?? { weight: 0, reps: 0 };
    const isPr =
      best.weight > prior.weight || (best.weight === prior.weight && best.reps > prior.reps);

    if (isPr) {
      records.push({
        exerciseId: log.exerciseId,
        exerciseName: log.exerciseName,
        weight: best.weight,
        reps: best.reps,
        previousBestWeight: prior.weight,
        previousBestReps: prior.reps,
      });
    }
  }

  return records;
}

async function finalizeSession(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: { exerciseLogs: { include: { sets: true }, orderBy: { exerciseOrder: "asc" } } },
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  if (session.status === "COMPLETED") {
    return session; // idempotent: already completed
  }

  const now = new Date();
  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      endedAt: now,
      duration: timerService.computeElapsedSeconds(session.startedAt, now),
      totalVolume: calculateTotalVolume(session.exerciseLogs as unknown as LogWithSets[]),
    },
  });
}

async function getSessionWithLogs(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: { exerciseLogs: { include: { sets: true }, orderBy: { exerciseOrder: "asc" } } },
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  return session;
}

async function completeWorkout(userId: string, sessionId: string) {
  const completed = await finalizeSession(sessionId, userId);

  const withLogs = await getSessionWithLogs(sessionId, userId);
  const logs = withLogs.exerciseLogs as unknown as LogWithSets[];

  const records = await detectPersonalRecords(userId, sessionId, withLogs.startedAt, logs);

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { weight: true },
  });
  const bodyWeight = profile?.weight ? Number(profile.weight) : 70;

  const summary = calculateWorkoutSummary(
    {
      id: withLogs.id,
      startedAt: withLogs.startedAt,
      endedAt: withLogs.endedAt,
      duration: withLogs.duration,
      logs,
    },
    records,
    estimateCalories(bodyWeight, withLogs.duration ?? 0, summaryCompletedSets(logs)),
  );

  return summary;
}

function summaryCompletedSets(logs: LogWithSets[]): number {
  return logs.reduce((sum, log) => sum + log.sets.filter((set) => set.completed).length, 0);
}

async function getWorkoutSummary(sessionId: string, userId: string) {
  const withLogs = await getSessionWithLogs(sessionId, userId);
  const logs = withLogs.exerciseLogs as unknown as LogWithSets[];

  if (withLogs.status === "ACTIVE" || withLogs.status === "PAUSED") {
    // Preview totals for a live session (client regenerate on complete).
    return calculateWorkoutSummary({
      id: withLogs.id,
      startedAt: withLogs.startedAt,
      endedAt: withLogs.endedAt,
      duration: withLogs.duration,
      logs,
    });
  }

  const records = await detectPersonalRecords(userId, sessionId, withLogs.startedAt, logs);

  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { weight: true },
  });
  const bodyWeight = profile?.weight ? Number(profile.weight) : 70;

  return calculateWorkoutSummary(
    {
      id: withLogs.id,
      startedAt: withLogs.startedAt,
      endedAt: withLogs.endedAt,
      duration: withLogs.duration,
      logs,
    },
    records,
    estimateCalories(
      bodyWeight,
      withLogs.duration ?? calculateDuration(withLogs.startedAt, new Date()),
      summaryCompletedSets(logs),
    ),
  );
}

export const workoutSummaryService = {
  completeWorkout,
  getWorkoutSummary,
};