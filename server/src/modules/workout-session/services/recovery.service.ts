import { prisma } from "../../../config/prisma";
import { ApiError } from "../../../utils/ApiError";
import { SESSION_INCLUDE } from "./workout-session.service";

async function getActiveSession(userId: string) {
  return prisma.workoutSession.findFirst({
    where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
    orderBy: { updatedAt: "desc" },
    include: SESSION_INCLUDE,
  });
}

async function recoverSession(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: SESSION_INCLUDE,
  });

  if (!session) {
    throw new ApiError(404, "Recoverable workout session not found");
  }

  if (session.status !== "ACTIVE" && session.status !== "PAUSED") {
    throw new ApiError(409, "Workout session is not recoverable");
  }

  if (session.status === "PAUSED") {
    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: { status: "ACTIVE" },
    });
  }

  return prisma.workoutSession.findFirstOrThrow({
    where: { id: sessionId },
    include: SESSION_INCLUDE,
  });
}

async function clearRecoveredSession(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new ApiError(404, "Recoverable workout session not found");
  }

  if (session.status !== "ACTIVE" && session.status !== "PAUSED") {
    throw new ApiError(409, "Workout session is not recoverable");
  }

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { status: "ABANDONED", endedAt: new Date() },
  });
}

export const recoveryService = {
  getActiveSession,
  recoverSession,
  clearRecoveredSession,
};
