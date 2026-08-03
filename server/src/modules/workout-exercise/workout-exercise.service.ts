import { prisma } from "../../config/prisma";
import { deleteCache } from "../../lib/cache";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateWorkoutExerciseInput,
  UpdateWorkoutExerciseInput,
  ReplaceWorkoutExerciseInput,
  ReorderWorkoutExercisesInput,
} from "./workout-exercise.types";

const PLAN_CACHE_PREFIX = "workout-plan:";
const USER_PLANS_CACHE_PREFIX = "user-plans:";

async function verifyDayOwnership(dayId: string, userId: string) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId },
    include: { workoutPlan: { select: { userId: true } } },
  });

  if (!day) {
    throw new ApiError(404, "Day not found");
  }

  if (day.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return day;
}

async function getNextOrder(workoutDayId: string): Promise<number> {
  const lastExercise = await prisma.workoutPlanExercise.findFirst({
    where: { workoutDayId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return (lastExercise?.order ?? -1) + 1;
}

async function createWorkoutExercise(userId: string, data: CreateWorkoutExerciseInput) {
  const day = await verifyDayOwnership(data.workoutDayId, userId);

  const order = await getNextOrder(data.workoutDayId);

  const exercise = await prisma.workoutPlanExercise.create({
    data: {
      workoutDayId: data.workoutDayId,
      exerciseId: data.exerciseId,
      exerciseName: data.exerciseName,
      gifUrl: data.gifUrl,
      order,
      sets: data.sets,
      reps: data.reps,
      restTime: data.restTime,
      notes: data.notes,
    },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${day.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return exercise;
}

async function getWorkoutExercises(workoutDayId: string, userId: string) {
  await verifyDayOwnership(workoutDayId, userId);

  return prisma.workoutPlanExercise.findMany({
    where: { workoutDayId },
    orderBy: { order: "asc" },
  });
}

async function getWorkoutExercise(exerciseId: string, userId: string) {
  const exercise = await prisma.workoutPlanExercise.findUnique({
    where: { id: exerciseId },
    include: {
      workoutDay: {
        include: { workoutPlan: { select: { userId: true } } },
      },
    },
  });

  if (!exercise) {
    throw new ApiError(404, "Workout exercise not found");
  }

  if (exercise.workoutDay.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return exercise;
}

async function updateWorkoutExercise(exerciseId: string, userId: string, data: UpdateWorkoutExerciseInput) {
  const exercise = await prisma.workoutPlanExercise.findUnique({
    where: { id: exerciseId },
    include: {
      workoutDay: {
        include: { workoutPlan: { select: { id: true, userId: true } } },
      },
    },
  });

  if (!exercise) {
    throw new ApiError(404, "Workout exercise not found");
  }

  if (exercise.workoutDay.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  const updated = await prisma.workoutPlanExercise.update({
    where: { id: exerciseId },
    data,
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${exercise.workoutDay.workoutPlan.id}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return updated;
}

async function replaceWorkoutExercise(
  workoutExerciseId: string,
  data: ReplaceWorkoutExerciseInput,
  userId: string,
) {
  const exercise = await prisma.workoutPlanExercise.findUnique({
    where: { id: workoutExerciseId },
    include: {
      workoutDay: {
        include: { workoutPlan: { select: { id: true, userId: true } } },
      },
    },
  });

  if (!exercise) {
    throw new ApiError(404, "Workout exercise not found");
  }

  if (exercise.workoutDay.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  const replaced = await prisma.workoutPlanExercise.update({
    where: { id: workoutExerciseId },
    data: {
      exerciseId: data.exerciseId,
      exerciseName: data.exerciseName,
      gifUrl: data.gifUrl,
    },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${exercise.workoutDay.workoutPlan.id}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return replaced;
}

async function reorderWorkoutExercises(userId: string, data: ReorderWorkoutExercisesInput) {
  await verifyDayOwnership(data.workoutDayId, userId);

  // Verify all exercise IDs belong to this day
  const exerciseIds = data.exercises.map((e) => e.id);
  const existingExercises = await prisma.workoutPlanExercise.findMany({
    where: { id: { in: exerciseIds }, workoutDayId: data.workoutDayId },
    select: { id: true },
  });

  if (existingExercises.length !== exerciseIds.length) {
    throw new ApiError(400, "One or more exercises do not belong to this day");
  }

  await prisma.$transaction(async (tx) => {
    // Two-pass to avoid @@unique([workoutDayId, order]) conflicts on swap
    for (const exercise of data.exercises) {
      await tx.workoutPlanExercise.update({
        where: { id: exercise.id },
        data: { order: -(exercise.order + 1) },
      });
    }
    for (const exercise of data.exercises) {
      await tx.workoutPlanExercise.update({
        where: { id: exercise.id },
        data: { order: exercise.order },
      });
    }
  });

  const day = await prisma.workoutDay.findUnique({
    where: { id: data.workoutDayId },
    select: { workoutPlanId: true },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${day?.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);
}

async function deleteWorkoutExercise(exerciseId: string, userId: string) {
  const exercise = await prisma.workoutPlanExercise.findUnique({
    where: { id: exerciseId },
    include: {
      workoutDay: {
        include: { workoutPlan: { select: { id: true, userId: true } } },
      },
    },
  });

  if (!exercise) {
    throw new ApiError(404, "Workout exercise not found");
  }

  if (exercise.workoutDay.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  await prisma.workoutPlanExercise.delete({ where: { id: exerciseId } });

  await deleteCache(`${PLAN_CACHE_PREFIX}${exercise.workoutDay.workoutPlan.id}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);
}

export const workoutExerciseService = {
  createWorkoutExercise,
  getWorkoutExercises,
  getWorkoutExercise,
  updateWorkoutExercise,
  replaceWorkoutExercise,
  reorderWorkoutExercises,
  deleteWorkoutExercise,
};
