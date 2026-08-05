import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import type {
  CreateExerciseLogInput,
  UpdateExerciseLogInput,
} from "../types/exercise-log.types";

const LOG_INCLUDE = {
  sets: { orderBy: { setNumber: "asc" } },
} as const;

async function assertSessionOwned(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true, status: true },
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  return session;
}

async function createExerciseLog(userId: string, data: CreateExerciseLogInput) {
  const session = await assertSessionOwned(data.workoutSessionId, userId);

  if (session.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot log exercises on a session that is not active");
  }

  return prisma.exerciseLog.create({
    data: {
      workoutSessionId: data.workoutSessionId,
      exerciseId: data.exerciseId,
      exerciseName: data.exerciseName,
      exerciseOrder: data.exerciseOrder ?? 0,
      notes: data.notes,
      sets: {
        create: data.sets.map((set) => ({
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          restTime: set.restTime,
          setType: set.setType,
          isWarmup: set.isWarmup ?? set.setType === "WARMUP",
          isFailure: set.isFailure ?? set.setType === "FAILURE",
          completed: set.completed ?? false,
        })),
      },
    },
    include: LOG_INCLUDE,
  });
}

async function getExerciseLog(logId: string, userId: string) {
  const log = await prisma.exerciseLog.findUnique({
    where: { id: logId },
    include: { ...LOG_INCLUDE, workoutSession: { select: { userId: true } } },
  });

  if (!log) {
    throw new ApiError(404, "Exercise log not found");
  }

  if (log.workoutSession.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return log;
}

async function updateExerciseLog(logId: string, userId: string, data: UpdateExerciseLogInput) {
  await getExerciseLog(logId, userId);

  return prisma.$transaction(async (tx) => {
    const sets = data.sets;

    if (sets) {
      const current = await tx.exerciseLogSet.findMany({
        where: { exerciseLogId: logId },
      });

      const incomingIds = new Set(
        sets.filter((set) => set.id).map((set) => set.id as string),
      );

      await tx.exerciseLogSet.deleteMany({
        where: { exerciseLogId: logId, id: { notIn: [...incomingIds] } },
      });

      for (const set of sets) {
        if (set.id) {
          await tx.exerciseLogSet.update({
            where: { id: set.id },
            data: {
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              restTime: set.restTime,
              setType: set.setType,
              isWarmup: set.isWarmup ?? set.setType === "WARMUP",
              isFailure: set.isFailure ?? set.setType === "FAILURE",
              completed: set.completed ?? false,
            },
          });
        } else {
          await tx.exerciseLogSet.create({
            data: {
              exerciseLogId: logId,
              setNumber: set.setNumber,
              weight: set.weight,
              reps: set.reps,
              restTime: set.restTime,
              setType: set.setType,
              isWarmup: set.isWarmup ?? set.setType === "WARMUP",
              isFailure: set.isFailure ?? set.setType === "FAILURE",
              completed: set.completed ?? false,
            },
          });
        }
      }
    }

    if (data.notes !== undefined) {
      await tx.exerciseLog.update({
        where: { id: logId },
        data: { notes: data.notes },
      });
    }

    return tx.exerciseLog.findUnique({
      where: { id: logId },
      include: LOG_INCLUDE,
    });
  });
}

async function deleteExerciseLog(logId: string, userId: string) {
  await getExerciseLog(logId, userId);

  return prisma.exerciseLog.delete({
    where: { id: logId },
  });
}

export const exerciseLogService = {
  createExerciseLog,
  getExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
};
