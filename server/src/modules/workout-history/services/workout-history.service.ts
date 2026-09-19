import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { STATS_STATUSES } from "../../../utils/workoutStats";
import { detectPersonalRecords } from "../../workout-session/services/workout-summary.service";
import { decodeCursor, encodeCursor } from "../utils/cursor";
import type {
  WorkoutHistoryDetail,
  WorkoutHistoryExercise,
  WorkoutHistoryItem,
  WorkoutHistoryPage,
  WorkoutHistorySet,
  WorkoutHistorySort,
} from "../types/workout-history.types";
import type { WorkoutHistoryQuery as ParsedQuery } from "../validations/workout-history.validation";

type OrderEntry = Record<string, "asc" | "desc">;

type HistoryRow = {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  totalVolume: { toString(): string } | number | null;
  workoutPlan: { id: string; name: string };
  workoutDay: { id: string; name: string };
  _count: { exerciseLogs: number };
};

interface SortSpec {
  orderBy: OrderEntry[];
  value: (row: HistoryRow) => { v: string | number | null; i: string };
  where: (cursor: { v: string | number | null; i: string }) => Prisma.WorkoutSessionWhereInput;
}

const SORT_SPECS: Record<WorkoutHistorySort, SortSpec> = {
  newest: {
    orderBy: [{ startedAt: "desc" }, { id: "desc" }],
    value: (row) => ({ v: row.startedAt.toISOString(), i: row.id }),
    where: (cursor) => ({
      OR: [
        { startedAt: { lt: cursor.v as string } },
        { startedAt: cursor.v as string, id: { lt: cursor.i } },
      ],
    }),
  },
  oldest: {
    orderBy: [{ startedAt: "asc" }, { id: "asc" }],
    value: (row) => ({ v: row.startedAt.toISOString(), i: row.id }),
    where: (cursor) => ({
      OR: [
        { startedAt: { gt: cursor.v as string } },
        { startedAt: cursor.v as string, id: { gt: cursor.i } },
      ],
    }),
  },
  volume: {
    orderBy: [{ totalVolume: "desc" }, { id: "desc" }],
    value: (row) => ({ v: Number(row.totalVolume), i: row.id }),
    where: (cursor) => ({
      totalVolume: { not: null },
      OR: [
        { totalVolume: { lt: cursor.v as number } },
        { totalVolume: cursor.v as number, id: { lt: cursor.i } },
      ],
    }),
  },
  duration: {
    orderBy: [{ duration: "desc" }, { id: "desc" }],
    value: (row) => ({ v: row.duration, i: row.id }),
    where: (cursor) => ({
      duration: { not: null },
      OR: [
        { duration: { lt: cursor.v as number } },
        { duration: cursor.v as number, id: { lt: cursor.i } },
      ],
    }),
  },
};

function searchWhere(search: string): Prisma.WorkoutSessionWhereInput {
  const term = { contains: search, mode: "insensitive" as const };
  return {
    OR: [
      { workoutPlan: { name: term } },
      { workoutDay: { name: term } },
      { exerciseLogs: { some: { exerciseName: term } } },
    ],
  };
}

function toItem(row: HistoryRow): WorkoutHistoryItem {
  return {
    id: row.id,
    workoutPlanId: row.workoutPlan.id,
    workoutDayId: row.workoutDay.id,
    planName: row.workoutPlan.name,
    dayName: row.workoutDay.name,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    duration: row.duration,
    totalVolume: row.totalVolume ? Number(row.totalVolume) : 0,
    exerciseCount: row._count.exerciseLogs,
  };
}

async function getWorkoutHistory(
  userId: string,
  query: ParsedQuery,
): Promise<WorkoutHistoryPage> {
  const { cursor: cursorRaw, limit, search, sort } = query;
  const spec = SORT_SPECS[sort];

  let cursor: { v: string | number | null; i: string } | null = null;
  if (cursorRaw) {
    const decoded = decodeCursor(cursorRaw);
    if (!decoded) {
      throw new ApiError(400, "Invalid cursor");
    }
    cursor = decoded;
  }

  const conditions: Prisma.WorkoutSessionWhereInput[] = [
    { userId },
    { status: { in: [...STATS_STATUSES] } },
  ];
  if (search) conditions.push(searchWhere(search));
  if (cursor) conditions.push(spec.where(cursor));

  const rows = (await prisma.workoutSession.findMany({
    where: { AND: conditions },
    orderBy: spec.orderBy,
    take: limit + 1,
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      duration: true,
      totalVolume: true,
      workoutPlan: { select: { id: true, name: true } },
      workoutDay: { select: { id: true, name: true } },
      _count: { select: { exerciseLogs: true } },
    },
  })) as unknown as HistoryRow[];

  const hasNextPage = rows.length > limit;
  const pageRows = hasNextPage ? rows.slice(0, limit) : rows;

  let nextCursor: string | null = null;
  if (hasNextPage) {
    const last = pageRows[pageRows.length - 1];
    const { v, i } = spec.value(last);
    nextCursor = encodeCursor(v, i);
  }

  return {
    items: pageRows.map(toItem),
    nextCursor,
    hasNextPage,
  };
}

type DetailSetRow = {
  setNumber: number;
  weight: { toString(): string };
  reps: number;
  setType: string;
  isWarmup: boolean;
  isFailure: boolean;
  rpe: { toString(): string } | null;
  rir: number | null;
  tempo: string | null;
  restTime: number;
  completed: boolean;
};

type DetailLogRow = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  notes: string | null;
  sets: DetailSetRow[];
};

type DetailSessionRow = {
  id: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  totalVolume: { toString(): string } | null;
  workoutPlan: { id: string; name: string };
  workoutDay: { id: string; name: string };
  exerciseLogs: DetailLogRow[];
};

const SET_TYPES = ["WARMUP", "WORKING", "FAILURE"] as const;

function toSet(row: DetailSetRow): WorkoutHistorySet {
  return {
    setNumber: row.setNumber,
    weight: Number(row.weight),
    reps: row.reps,
    setType: SET_TYPES.includes(row.setType as (typeof SET_TYPES)[number])
      ? (row.setType as (typeof SET_TYPES)[number])
      : "WORKING",
    isWarmup: row.isWarmup,
    isFailure: row.isFailure,
    rpe: row.rpe === null ? null : Number(row.rpe),
    rir: row.rir,
    tempo: row.tempo,
    restTime: row.restTime,
    completed: row.completed,
  };
}

async function getWorkoutDetail(
  userId: string,
  sessionId: string,
): Promise<WorkoutHistoryDetail> {
  const session = (await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      workoutPlan: { select: { id: true, name: true } },
      workoutDay: { select: { id: true, name: true } },
      exerciseLogs: {
        orderBy: { exerciseOrder: "asc" },
        include: { sets: { orderBy: { setNumber: "asc" } } },
      },
    },
  })) as unknown as DetailSessionRow | null;

  if (!session || session.status !== "COMPLETED") {
    throw new ApiError(404, "Workout not found");
  }

  const personalRecords = await detectPersonalRecords(
    userId,
    session.id,
    session.startedAt,
    session.exerciseLogs,
  );

  const exercises: WorkoutHistoryExercise[] = session.exerciseLogs.map(
    (log) => ({
      id: log.id,
      exerciseId: log.exerciseId,
      exerciseName: log.exerciseName,
      exerciseOrder: log.exerciseOrder,
      notes: log.notes,
      sets: log.sets.map(toSet),
    }),
  );

  return {
    id: session.id,
    workoutPlanId: session.workoutPlan.id,
    workoutDayId: session.workoutDay.id,
    planName: session.workoutPlan.name,
    dayName: session.workoutDay.name,
    status: "COMPLETED",
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt ? session.endedAt.toISOString() : null,
    duration: session.duration,
    totalVolume: session.totalVolume ? Number(session.totalVolume) : 0,
    exerciseCount: session.exerciseLogs.length,
    exercises,
    personalRecords,
  };
}

export const workoutHistoryService = {
  getWorkoutHistory,
  getWorkoutDetail,
};