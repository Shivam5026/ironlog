import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { STATS_STATUSES } from "../../../utils/workoutStats";
import type {
  NewPersonalRecord,
  PersonalRecordItem,
  PersonalRecordList,
} from "../types/personal-record.types";

type SetRow = {
  weight: { toString(): string };
  reps: number;
  completed: boolean;
};

type LogRow = {
  exerciseId: string;
  exerciseName: string;
  sets: SetRow[];
  workoutSession: { id: string; startedAt: Date };
};

type ComputedPersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  estimatedOneRepMax: number;
  achievedAt: Date;
};

type PersonalRecordRow = {
  exerciseId: string;
  exerciseName: string;
  bestWeight: { toString(): string };
  bestVolume: { toString(): string };
  estimatedOneRepMax: { toString(): string };
  achievedAt: Date;
};

function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Epley formula: 1RM = weight * (1 + reps / 30).
 * Returns null when the estimate is not meaningful (missing weight or reps).
 */
export function estimateOneRepMax(
  weight: number,
  reps: number,
): number | null {
  if (weight <= 0 || reps <= 0) return null;
  return roundTo2(weight * (1 + reps / 30));
}

async function getCompletedLogs(
  userId: string,
  exerciseId?: string,
): Promise<LogRow[]> {
  return prisma.exerciseLog.findMany({
    where: {
      ...(exerciseId ? { exerciseId } : {}),
      workoutSession: {
        userId,
        status: { in: [...STATS_STATUSES] },
      },
    },
    include: {
      sets: true,
      workoutSession: { select: { id: true, startedAt: true } },
    },
    orderBy: { workoutSession: { startedAt: "asc" } },
  }) as unknown as Promise<LogRow[]>;
}

/**
 * Single source of truth for the persisted PR metrics.
 * Logs must be ordered oldest -> newest so ties keep the first achievement.
 * Returns null when the exercise has no completed sets to derive PRs from.
 */
function computePersonalRecord(
  exerciseId: string,
  exerciseName: string,
  logs: LogRow[],
): ComputedPersonalRecord | null {
  let firstCompletedAt: Date | null = null;

  let bestWeight = 0;
  let bestVolume = 0;
  let estimatedOneRepMax = 0;

  let weightAchievedAt: Date | null = null;
  let volumeAchievedAt: Date | null = null;
  let oneRmAchievedAt: Date | null = null;

  for (const log of logs) {
    const startedAt = log.workoutSession.startedAt;
    let sessionVolume = 0;
    let completedSets = 0;

    for (const set of log.sets) {
      if (!set.completed) continue;

      const weight = Number(set.weight);
      completedSets += 1;
      sessionVolume += weight * set.reps;

      if (!firstCompletedAt) firstCompletedAt = startedAt;

      if (weight > bestWeight) {
        bestWeight = weight;
        weightAchievedAt = startedAt;
      }

      const oneRepMax = estimateOneRepMax(weight, set.reps);
      if (oneRepMax !== null && oneRepMax > estimatedOneRepMax) {
        estimatedOneRepMax = oneRepMax;
        oneRmAchievedAt = startedAt;
      }
    }

    if (completedSets > 0) {
      const volume = roundTo2(sessionVolume);
      if (volume > bestVolume) {
        bestVolume = volume;
        volumeAchievedAt = startedAt;
      }
    }
  }

  if (!firstCompletedAt) return null;

  const achievementDates = [
    weightAchievedAt,
    volumeAchievedAt,
    oneRmAchievedAt,
  ].filter((date): date is Date => date !== null);

  const achievedAt =
    achievementDates.length > 0
      ? new Date(Math.max(...achievementDates.map((date) => date.getTime())))
      : firstCompletedAt;

  return {
    exerciseId,
    exerciseName,
    bestWeight,
    bestVolume,
    estimatedOneRepMax,
    achievedAt,
  };
}

function toItem(row: PersonalRecordRow): PersonalRecordItem {
  return {
    exerciseId: row.exerciseId,
    exerciseName: row.exerciseName,
    bestWeight: Number(row.bestWeight),
    bestVolume: Number(row.bestVolume),
    estimatedOneRepMax: Number(row.estimatedOneRepMax),
    achievedAt: row.achievedAt.toISOString(),
  };
}

function groupLogs(logs: LogRow[]): Map<string, { name: string; logs: LogRow[] }> {
  const grouped = new Map<string, { name: string; logs: LogRow[] }>();
  for (const log of logs) {
    const entry = grouped.get(log.exerciseId);
    if (entry) {
      entry.logs.push(log);
    } else {
      grouped.set(log.exerciseId, { name: log.exerciseName, logs: [log] });
    }
  }
  return grouped;
}

function computeGrouped(
  grouped: Map<string, { name: string; logs: LogRow[] }>,
): ComputedPersonalRecord[] {
  const computed: ComputedPersonalRecord[] = [];
  for (const [exerciseId, { name, logs }] of grouped) {
    const record = computePersonalRecord(exerciseId, name, logs);
    if (record) computed.push(record);
  }
  return computed;
}

async function persistPersonalRecords(
  userId: string,
  records: ComputedPersonalRecord[],
): Promise<void> {
  const statements = records.map((record) =>
    prisma.personalRecord.upsert({
      where: {
        userId_exerciseId: { userId, exerciseId: record.exerciseId },
      },
      create: {
        userId,
        exerciseId: record.exerciseId,
        exerciseName: record.exerciseName,
        bestWeight: record.bestWeight,
        bestVolume: record.bestVolume,
        estimatedOneRepMax: record.estimatedOneRepMax,
        achievedAt: record.achievedAt,
      },
      update: {
        exerciseName: record.exerciseName,
        bestWeight: record.bestWeight,
        bestVolume: record.bestVolume,
        estimatedOneRepMax: record.estimatedOneRepMax,
        achievedAt: record.achievedAt,
      },
    }),
  );

  const exerciseIds = records.map((record) => record.exerciseId);
  const cleanup =
    exerciseIds.length > 0
      ? prisma.personalRecord.deleteMany({
          where: { userId, exerciseId: { notIn: exerciseIds } },
        })
      : prisma.personalRecord.deleteMany({ where: { userId } });

  await prisma.$transaction([...statements, cleanup]);
}

/**
 * Recomputes every PR for the user from COMPLETED workout data and upserts
 * them into the `PersonalRecord` table so estimates persist. Rows for
 * exercises that no longer have completed sets are removed.
 */
async function syncPersonalRecords(userId: string): Promise<void> {
  const logs = await getCompletedLogs(userId);
  await persistPersonalRecords(userId, computeGrouped(groupLogs(logs)));
}

/**
 * Central PR comparison for workout completion. A notification is only
 * produced when a value from this session strictly exceeds the all-time best
 * from every other COMPLETED session (ties and worse sets never notify).
 * Also refreshes the persisted `PersonalRecord` table.
 */
async function processCompletedWorkout(
  userId: string,
  sessionId: string,
): Promise<NewPersonalRecord[]> {
  const logs = await getCompletedLogs(userId);
  const current = computeGrouped(groupLogs(logs));
  const prior = computeGrouped(
    groupLogs(logs.filter((log) => log.workoutSession.id !== sessionId)),
  );
  const sessionExerciseIds = new Set(
    logs
      .filter((log) => log.workoutSession.id === sessionId)
      .map((log) => log.exerciseId),
  );

  const priorByExercise = new Map(
    prior.map((record) => [record.exerciseId, record]),
  );

  const newRecords: NewPersonalRecord[] = [];

  for (const record of current) {
    if (!sessionExerciseIds.has(record.exerciseId)) continue;

    const previous = priorByExercise.get(record.exerciseId);
    const previousWeight = previous?.bestWeight ?? 0;
    const previousVolume = previous?.bestVolume ?? 0;
    const previousOneRepMax = previous?.estimatedOneRepMax ?? 0;

    if (record.bestWeight > previousWeight) {
      newRecords.push({
        exerciseId: record.exerciseId,
        exerciseName: record.exerciseName,
        type: "WEIGHT",
        value: record.bestWeight,
        previousValue: previousWeight,
      });
    }

    if (record.bestVolume > previousVolume) {
      newRecords.push({
        exerciseId: record.exerciseId,
        exerciseName: record.exerciseName,
        type: "VOLUME",
        value: record.bestVolume,
        previousValue: previousVolume,
      });
    }

    if (record.estimatedOneRepMax > previousOneRepMax) {
      newRecords.push({
        exerciseId: record.exerciseId,
        exerciseName: record.exerciseName,
        type: "ONE_REP_MAX",
        value: record.estimatedOneRepMax,
        previousValue: previousOneRepMax,
      });
    }
  }

  await persistPersonalRecords(userId, current);

  return newRecords;
}

/**
 * One-time backfill for users whose PRs predate persistence: if they have
 * completed workout data but no stored rows yet, recompute them on read.
 */
async function ensureSynced(userId: string): Promise<void> {
  const [completedLogCount, recordCount] = await Promise.all([
    prisma.exerciseLog.count({
      where: {
        workoutSession: {
          userId,
          status: { in: [...STATS_STATUSES] },
        },
      },
    }),
    prisma.personalRecord.count({ where: { userId } }),
  ]);

  if (completedLogCount > 0 && recordCount === 0) {
    await syncPersonalRecords(userId);
  }
}

async function getPersonalRecords(userId: string): Promise<PersonalRecordList> {
  await ensureSynced(userId);

  const rows = await prisma.personalRecord.findMany({
    where: { userId },
    orderBy: { achievedAt: "desc" },
  });

  return { items: rows.map(toItem) };
}

async function getPersonalRecord(
  userId: string,
  exerciseId: string,
): Promise<PersonalRecordItem> {
  await ensureSynced(userId);

  const row = await prisma.personalRecord.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
  });

  if (!row) {
    throw new ApiError(404, "No personal records found for this exercise");
  }

  return toItem(row);
}

export const personalRecordService = {
  estimateOneRepMax,
  syncPersonalRecords,
  processCompletedWorkout,
  getPersonalRecords,
  getPersonalRecord,
};
