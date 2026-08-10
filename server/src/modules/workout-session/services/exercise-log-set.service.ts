import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import type {
  CreateExerciseLogSetInput,
  UpdateExerciseLogSetInput,
  CompleteExerciseLogSetInput,
  ReorderExerciseLogSetInput,
} from "../types/exercise-log-set.types";

async function assertLogOwned(logId: string, userId: string) {
  const log = await prisma.exerciseLog.findFirst({
    where: {
      id: logId,
      workoutSession: { userId },
    },
    select: { id: true, workoutSession: { select: { status: true } } },
  });

  if (!log) {
    throw new ApiError(404, "Exercise log not found");
  }

  return log;
}

async function assertLogActive(logId: string, userId: string) {
  const log = await assertLogOwned(logId, userId);

  if (log.workoutSession.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot modify sets on a session that is not active");
  }

  return log;
}

async function createSet(userId: string, data: CreateExerciseLogSetInput) {
  await assertLogActive(data.exerciseLogId, userId);

  return prisma.exerciseLogSet.create({
    data: {
      exerciseLogId: data.exerciseLogId,
      weight: data.weight,
      reps: data.reps,
      setNumber: data.setNumber,
      restTime: data.restTime,
      setType: data.setType,
      isWarmup: data.setType === "WARMUP",
      isFailure: data.setType === "FAILURE",
    },
  });
}

async function getOwnedSet(setId: string, userId: string) {
  const set = await prisma.exerciseLogSet.findFirst({
    where: {
      id: setId,
      exerciseLog: { workoutSession: { userId } },
    },
    include: { exerciseLog: { select: { workoutSession: { select: { status: true } } } } },
  });

  if (!set) {
    throw new ApiError(404, "Exercise log set not found");
  }

  return set;
}

async function updateSet(setId: string, userId: string, data: UpdateExerciseLogSetInput) {
  const set = await getOwnedSet(setId, userId);

  if (set.exerciseLog.workoutSession.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot modify sets on a session that is not active");
  }

  return prisma.exerciseLogSet.update({
    where: { id: setId },
    data: {
      ...data,
      isWarmup: data.setType !== undefined ? data.setType === "WARMUP" : undefined,
      isFailure: data.setType !== undefined ? data.setType === "FAILURE" : undefined,
    },
  });
}

async function completeSet(setId: string, userId: string, data: CompleteExerciseLogSetInput) {
  const set = await getOwnedSet(setId, userId);

  if (set.exerciseLog.workoutSession.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot modify sets on a session that is not active");
  }

  return prisma.exerciseLogSet.update({
    where: { id: setId },
    data: { completed: data.completed },
  });
}

async function deleteSet(setId: string, userId: string) {
  const set = await getOwnedSet(setId, userId);

  if (set.exerciseLog.workoutSession.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot modify sets on a session that is not active");
  }

  return prisma.exerciseLogSet.delete({
    where: { id: setId },
  });
}

async function reorderSets(userId: string, data: ReorderExerciseLogSetInput) {
  const { exerciseLogId, orderedIds } = data;
  const log = await assertLogOwned(exerciseLogId, userId);

  if (log.workoutSession.status !== "ACTIVE") {
    throw new ApiError(409, "Cannot modify sets on a session that is not active");
  }

  const existing = await prisma.exerciseLogSet.findMany({
    where: { exerciseLogId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((set) => set.id));
  if (orderedIds.length !== existing.length || !orderedIds.every((id) => existingIds.has(id))) {
    throw new ApiError(400, "Ordered ids do not match the existing sets");
  }

  return prisma.$transaction(async (tx) => {
    // temporarily push each set to a distinct negative number (out of the
    // unique(exerciseLogId, setNumber) range), then write the real order
    for (const [index, set] of existing.entries()) {
      await tx.exerciseLogSet.update({
        where: { id: set.id },
        data: { setNumber: -(index + 1) },
      });
    }

    for (const [index, id] of orderedIds.entries()) {
      await tx.exerciseLogSet.update({
        where: { id },
        data: { setNumber: index + 1 },
      });
    }

    return tx.exerciseLogSet.findMany({
      where: { exerciseLogId },
      orderBy: { setNumber: "asc" },
    });
  });
}

export const exerciseLogSetService = {
  createSet,
  updateSet,
  deleteSet,
  completeSet,
  reorderSets,
};
