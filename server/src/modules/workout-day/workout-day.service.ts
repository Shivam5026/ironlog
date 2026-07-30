import { prisma } from "../../config/prisma";
import { deleteCache } from "../../lib/cache";
import { ApiError } from "../../utils/ApiError";
import type { CreateWorkoutDayInput, UpdateWorkoutDayInput, ReorderWorkoutDaysInput } from "./workout-day.types";

const PLAN_CACHE_PREFIX = "workout-plan:";
const USER_PLANS_CACHE_PREFIX = "user-plans:";

async function verifyPlanOwnership(workoutPlanId: string, userId: string) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: workoutPlanId },
    select: { id: true, userId: true },
  });

  if (!plan) {
    throw new ApiError(404, "Plan not found");
  }

  if (plan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return plan;
}

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

async function getNextOrder(workoutPlanId: string): Promise<number> {
  const lastDay = await prisma.workoutDay.findFirst({
    where: { workoutPlanId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return (lastDay?.order ?? -1) + 1;
}

async function createWorkoutDay(userId: string, data: CreateWorkoutDayInput) {
  await verifyPlanOwnership(data.workoutPlanId, userId);

  const order = data.order ?? (await getNextOrder(data.workoutPlanId));

  const day = await prisma.workoutDay.create({
    data: {
      workoutPlanId: data.workoutPlanId,
      name: data.name,
      order,
    },
    include: {
      exercises: { orderBy: { order: "asc" } },
    },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${data.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return day;
}

async function updateWorkoutDay(dayId: string, userId: string, data: UpdateWorkoutDayInput) {
  const day = await verifyDayOwnership(dayId, userId);

  const updated = await prisma.workoutDay.update({
    where: { id: dayId },
    data: { name: data.name },
    include: {
      exercises: { orderBy: { order: "asc" } },
    },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${day.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return updated;
}

async function deleteWorkoutDay(dayId: string, userId: string) {
  const day = await verifyDayOwnership(dayId, userId);

  await prisma.workoutDay.delete({
    where: { id: dayId },
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${day.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);
}

async function getWorkoutDay(dayId: string, userId: string) {
  const day = await prisma.workoutDay.findUnique({
    where: { id: dayId },
    include: {
      exercises: { orderBy: { order: "asc" } },
      workoutPlan: { select: { userId: true } },
    },
  });

  if (!day) {
    throw new ApiError(404, "Day not found");
  }

  if (day.workoutPlan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return day;
}

async function getWorkoutDays(workoutPlanId: string, userId: string) {
  await verifyPlanOwnership(workoutPlanId, userId);

  return prisma.workoutDay.findMany({
    where: { workoutPlanId },
    include: {
      exercises: { orderBy: { order: "asc" } },
    },
    orderBy: { order: "asc" },
  });
}

async function reorderWorkoutDays(userId: string, data: ReorderWorkoutDaysInput) {
  const plan = await verifyPlanOwnership(data.workoutPlanId, userId);

  // Verify all day IDs belong to this plan
  const dayIds = data.days.map((d) => d.id);
  const existingDays = await prisma.workoutDay.findMany({
    where: { id: { in: dayIds }, workoutPlanId: plan.id },
    select: { id: true },
  });

  if (existingDays.length !== dayIds.length) {
    throw new ApiError(400, "One or more workout days do not belong to this plan");
  }

  await prisma.$transaction(async (tx) => {
    // Two-pass to avoid @@unique([workoutPlanId, order]) conflicts on swap
    for (const day of data.days) {
      await tx.workoutDay.update({
        where: { id: day.id },
        data: { order: -(day.order + 1) },
      });
    }
    for (const day of data.days) {
      await tx.workoutDay.update({
        where: { id: day.id },
        data: { order: day.order },
      });
    }
  });

  await deleteCache(`${PLAN_CACHE_PREFIX}${data.workoutPlanId}`);
  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);
}

export const workoutDayService = {
  createWorkoutDay,
  updateWorkoutDay,
  deleteWorkoutDay,
  getWorkoutDay,
  getWorkoutDays,
  reorderWorkoutDays,
};
