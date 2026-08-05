import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { timerService } from "./timer.service";
import type { StartWorkoutInput } from "../types/workout-session.types";

const SESSION_INCLUDE = {
  workoutPlan: {
    include: {
      workoutDays: {
        include: {
          exercises: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  },
  exerciseLogs: {
    include: { sets: { orderBy: { setNumber: "asc" } } },
    orderBy: { exerciseOrder: "asc" },
  },
} as const;

async function getSession(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: SESSION_INCLUDE,
  });

  if (!session) {
    throw new ApiError(404, "Workout session not found");
  }

  return session;
}

async function startWorkout(userId: string, { workoutPlanId }: StartWorkoutInput) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: workoutPlanId, userId },
    include: {
      workoutDays: {
        include: {
          exercises: { orderBy: { order: "asc" } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!plan) {
    throw new ApiError(404, "Workout plan not found");
  }

  const session = await prisma.$transaction(async (tx) => {
    const created = await tx.workoutSession.create({
      data: {
        userId,
        workoutPlanId,
        status: "ACTIVE",
      },
    });

    let exerciseOrder = 0;

    for (const day of plan.workoutDays) {
      for (const exercise of day.exercises) {
        await tx.exerciseLog.create({
          data: {
            workoutSessionId: created.id,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            exerciseOrder: exerciseOrder++,
            sets: {
              create: Array.from({ length: exercise.sets }, (_, i) => ({
                setNumber: i + 1,
                weight: 0,
                reps: exercise.reps,
                restTime: exercise.restTime,
                setType: "WORKING",
              })),
            },
          },
        });
      }
    }

    return created;
  });

  return getSession(session.id, userId);
}

async function pauseWorkout(sessionId: string, userId: string) {
  const session = await getSession(sessionId, userId);

  if (session.status === "COMPLETED" || session.status === "ABANDONED") {
    throw new ApiError(409, `Cannot pause a ${session.status.toLowerCase()} workout`);
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: { status: "PAUSED" },
  });
}

async function resumeWorkout(sessionId: string, userId: string) {
  const session = await getSession(sessionId, userId);

  if (session.status !== "PAUSED") {
    throw new ApiError(409, "Cannot resume a workout that is not paused");
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: { status: "ACTIVE" },
  });
}

async function finishWorkout(sessionId: string, userId: string) {
  const session = await getSession(sessionId, userId);

  if (session.status === "COMPLETED" || session.status === "ABANDONED") {
    throw new ApiError(409, `Cannot finish a ${session.status.toLowerCase()} workout`);
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const logs = await tx.exerciseLog.findMany({
      where: { workoutSessionId: sessionId },
      include: { sets: true },
    });

    const totalVolume = logs
      .flatMap((log) => log.sets)
      .filter((set) => set.completed)
      .reduce((sum, set) => sum + Number(set.weight) * set.reps, 0);

    return tx.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endedAt: now,
        duration: timerService.computeElapsedSeconds(session.startedAt, now),
        totalVolume,
      },
    });
  });
}

export const workoutSessionService = {
  getSession,
  startWorkout,
  pauseWorkout,
  resumeWorkout,
  finishWorkout,
};
