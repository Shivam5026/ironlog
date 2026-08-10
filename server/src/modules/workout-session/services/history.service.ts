import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import type {
  HistoryFilters,
  WorkoutDetail,
  WorkoutDetailExercise,
  WorkoutHistoryEntry,
} from "../types/history.types";

type SessionWithLogs = {
  id: string;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  totalVolume: { toString(): string } | null;
  workoutPlan: { id: string; name: string };
  exerciseLogs: {
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
  }[];
};

const TERMINAL_STATUSES = ["COMPLETED", "ABANDONED"] as const;
const SESSION_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED"] as const;

function toEntry(s: SessionWithLogs): WorkoutHistoryEntry {
  return {
    id: s.id,
    status: SESSION_STATUSES.includes(s.status as (typeof SESSION_STATUSES)[number])
      ? (s.status as (typeof SESSION_STATUSES)[number])
      : "ABANDONED",
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    duration: s.duration,
    totalVolume: s.totalVolume ? Number(s.totalVolume) : 0,
    planId: s.workoutPlan.id,
    planName: s.workoutPlan.name,
    exerciseCount: s.exerciseLogs.length,
    exerciseNames: s.exerciseLogs.map((l) => l.exerciseName),
  };
}

async function getWorkoutHistory(userId: string, filters: HistoryFilters = {}) {
  const { startDate, endDate, exercise, plan } = filters;

  const sessions = (await prisma.workoutSession.findMany({
    where: {
      userId,
      status: { in: [...TERMINAL_STATUSES] },
      ...(startDate && { startedAt: { gte: startDate } }),
      ...(endDate && { startedAt: { lte: endDate } }),
      ...(plan && { workoutPlanId: plan }),
      ...(exercise && {
        exerciseLogs: {
          some: { exerciseId: exercise },
        },
      }),
    },
    include: {
      workoutPlan: { select: { id: true, name: true } },
      exerciseLogs: {
        select: { exerciseId: true, exerciseName: true },
        orderBy: { exerciseOrder: "asc" },
      },
    },
    orderBy: { startedAt: "desc" },
  })) as unknown as SessionWithLogs[];

  return sessions.map(toEntry);
}

async function getWorkoutDetails(sessionId: string, userId: string) {
  const session = (await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      workoutPlan: { select: { id: true, name: true } },
      exerciseLogs: {
        include: {
          sets: { orderBy: { setNumber: "asc" }, select: { setNumber: true, weight: true, reps: true, completed: true } },
        },
        orderBy: { exerciseOrder: "asc" },
      },
    },
  })) as unknown as SessionWithLogs | null;

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  const exercises: WorkoutDetailExercise[] = session.exerciseLogs.map((log) => ({
    id: log.id,
    exerciseId: log.exerciseId,
    exerciseName: log.exerciseName,
    notes: log.notes,
    sets: log.sets.map((set) => ({
      setNumber: set.setNumber,
      weight: Number(set.weight),
      reps: set.reps,
      completed: set.completed,
    })),
  }));

  const result: WorkoutDetail = {
    id: session.id,
    status: session.status.toLowerCase() as WorkoutDetail["status"],
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    duration: session.duration,
    totalVolume: session.totalVolume ? Number(session.totalVolume) : 0,
    planId: session.workoutPlan.id,
    planName: session.workoutPlan.name,
    exercises,
  };

  return result;
}

async function deleteWorkout(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true, status: true },
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  if (!TERMINAL_STATUSES.includes(session.status as (typeof TERMINAL_STATUSES)[number])) {
    throw new ApiError(409, "Cannot delete an active workout");
  }

  await prisma.workoutSession.delete({ where: { id: sessionId } });
}

export const historyService = {
  getWorkoutHistory,
  getWorkoutDetails,
  deleteWorkout,
};
