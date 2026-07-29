import { prisma } from "../../config/prisma";
import { withCache, deleteCache } from "../../lib/cache";
import type {
  CreateWorkoutPlanInput,
  UpdateWorkoutPlanInput,
  CreateWorkoutDayInput,
  AddExerciseInput,
} from "./workout-plan.types";

const PLAN_CACHE_PREFIX = "workout-plan:";
const USER_PLANS_CACHE_PREFIX = "user-plans:";
const CACHE_TTL = 60 * 60;

function planCacheKey(id: string) {
  return `${PLAN_CACHE_PREFIX}${id}`;
}

function userPlansCacheKey(userId: string) {
  return `${USER_PLANS_CACHE_PREFIX}${userId}`;
}

async function createPlan(userId: string, data: CreateWorkoutPlanInput) {
  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      ...data,
    },
    include: {
      workoutDays: {
        include: {
          exercises: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  await deleteCache(userPlansCacheKey(userId));

  return plan;
}

async function getPlans(userId: string) {
  return withCache(
    userPlansCacheKey(userId),
    () =>
      prisma.workoutPlan.findMany({
        where: { userId },
        include: {
          workoutDays: {
            include: {
              exercises: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    CACHE_TTL,
  );
}

async function getPlanById(id: string) {
  return withCache(
    planCacheKey(id),
    () =>
      prisma.workoutPlan.findUnique({
        where: { id },
        include: {
          workoutDays: {
            include: {
              exercises: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      }),
    CACHE_TTL,
  );
}

async function updatePlan(id: string, userId: string, data: UpdateWorkoutPlanInput) {
  const plan = await prisma.workoutPlan.update({
    where: { id, userId },
    data,
  });

  await deleteCache(planCacheKey(id));
  await deleteCache(userPlansCacheKey(userId));

  return plan;
}

async function deletePlan(id: string, userId: string) {
  await prisma.workoutPlan.delete({
    where: { id, userId },
  });

  await deleteCache(planCacheKey(id));
  await deleteCache(userPlansCacheKey(userId));
}

async function addDay(workoutPlanId: string, userId: string, data: CreateWorkoutDayInput) {
  const day = await prisma.workoutDay.create({
    data: {
      workoutPlanId,
      ...data,
    },
    include: {
      exercises: {
        orderBy: { order: "asc" },
      },
    },
  });

  await deleteCache(planCacheKey(workoutPlanId));
  await deleteCache(userPlansCacheKey(userId));

  return day;
}

async function removeDay(dayId: string, userId: string) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId },
    include: { workoutPlan: true },
  });

  if (!day) {
    throw new Error("Day not found");
  }

  if (day.workoutPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.workoutDay.delete({
    where: { id: dayId },
  });

  await deleteCache(planCacheKey(day.workoutPlanId));
  await deleteCache(userPlansCacheKey(userId));
}

async function addExercise(workoutDayId: string, userId: string, data: AddExerciseInput) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: workoutDayId },
    include: { workoutPlan: true },
  });

  if (!day) {
    throw new Error("Day not found");
  }

  if (day.workoutPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const exercise = await prisma.workoutPlanExercise.create({
    data: {
      workoutDayId,
      ...data,
    },
  });

  await deleteCache(planCacheKey(day.workoutPlanId));
  await deleteCache(userPlansCacheKey(userId));

  return exercise;
}

async function removeExercise(exerciseId: string, userId: string) {
  const exercise = await prisma.workoutPlanExercise.findUnique({
    where: { id: exerciseId },
    include: {
      workoutDay: {
        include: { workoutPlan: true },
      },
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  if (exercise.workoutDay.workoutPlan.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.workoutPlanExercise.delete({
    where: { id: exerciseId },
  });

  await deleteCache(planCacheKey(exercise.workoutDay.workoutPlanId));
  await deleteCache(userPlansCacheKey(userId));
}

export const workoutPlanService = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  addDay,
  removeDay,
  addExercise,
  removeExercise,
};
