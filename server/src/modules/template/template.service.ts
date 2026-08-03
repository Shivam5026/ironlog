import { prisma } from "../../config/prisma";
import { deleteCache } from "../../lib/cache";
import { ApiError } from "../../utils/ApiError";
import type {
  CreateTemplateInput,
  UseTemplateInput,
  UpdateTemplateInput,
} from "./template.types";

const PLAN_CACHE_PREFIX = "workout-plan:";
const USER_PLANS_CACHE_PREFIX = "user-plans:";

/**
 * Clone a workout plan (days + exercises, with settings) into a template.
 * Proper relations — no JSON blob.
 */
async function createTemplate(userId: string, data: CreateTemplateInput) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: data.workoutPlanId },
    include: {
      workoutDays: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            select: {
              exerciseId: true,
              exerciseName: true,
              gifUrl: true,
              order: true,
              sets: true,
              reps: true,
              restTime: true,
              notes: true,
            },
          },
        },
      },
    },
  });

  if (!plan) {
    throw new ApiError(404, "Workout plan not found");
  }

  if (plan.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return prisma.workoutTemplate.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
      days: {
        create: plan.workoutDays.map((day) => ({
          name: day.name,
          order: day.order,
          exercises: {
            create: day.exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              gifUrl: exercise.gifUrl,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              restTime: exercise.restTime,
              notes: exercise.notes,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}

async function getTemplates(userId: string) {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });
}

/**
 * Clone a template (days + exercises, with settings) into a new workout
 * plan owned by the user. Fresh IDs and timestamps; nothing else reused.
 */
async function useTemplate(templateId: string, userId: string, data: UseTemplateInput) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: templateId },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { exercises: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  if (template.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  const plan = await prisma.$transaction(async (tx) => {
    const createdPlan = await tx.workoutPlan.create({
      data: {
        name: data.name,
        userId,
        workoutDays: {
          create: template.days.map((day) => ({
            name: day.name,
            order: day.order,
            exercises: {
              create: day.exercises.map((exercise) => ({
                exerciseId: exercise.exerciseId,
                exerciseName: exercise.exerciseName,
                gifUrl: exercise.gifUrl,
                order: exercise.order,
                sets: exercise.sets,
                reps: exercise.reps,
                restTime: exercise.restTime,
                notes: exercise.notes,
              })),
            },
          })),
        },
      },
      include: {
        workoutDays: {
          orderBy: { order: "asc" },
          include: { exercises: { orderBy: { order: "asc" } } },
        },
      },
    });

    await deleteCache(`${PLAN_CACHE_PREFIX}${createdPlan.id}`);
    return createdPlan;
  });

  await deleteCache(`${USER_PLANS_CACHE_PREFIX}${userId}`);

  return plan;
}

async function deleteTemplate(templateId: string, userId: string) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, userId: true },
  });

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  if (template.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  await prisma.$transaction(async (tx) => {
    await tx.templateExercise.deleteMany({
      where: { templateDay: { templateId } },
    });
    await tx.templateDay.deleteMany({ where: { templateId } });
    await tx.workoutTemplate.delete({ where: { id: templateId } });
  });
}

async function updateTemplate(templateId: string, userId: string, data: UpdateTemplateInput) {
  const template = await prisma.workoutTemplate.findUnique({
    where: { id: templateId },
    select: { id: true, userId: true },
  });

  if (!template) {
    throw new ApiError(404, "Template not found");
  }

  if (template.userId !== userId) {
    throw new ApiError(403, "Forbidden");
  }

  return prisma.workoutTemplate.update({
    where: { id: templateId },
    data: {
      name: data.name,
      description: data.description ?? null,
    },
  });
}

export const templateService = {
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  useTemplate,
};
