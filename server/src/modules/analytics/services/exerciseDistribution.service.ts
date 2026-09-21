import { prisma } from "../../../config/prisma";
import type {
  AnalyticsRange,
  ExerciseDistributionItem,
  ExerciseDistributionResponse,
} from "../types/analytics.types";

const MS_PER_DAY = 86_400_000;

function getRangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * MS_PER_DAY);
}

async function getExerciseDistribution(
  userId: string,
  range: AnalyticsRange = "all",
): Promise<ExerciseDistributionResponse> {
  const startDate = getRangeStartDate(range);

  const completedSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      ...(startDate ? { endedAt: { gte: startDate } } : {}),
    },
    select: { id: true },
  });

  if (completedSessions.length === 0) {
    return { range, totalSessions: 0, data: [] };
  }

  const sessionIds = completedSessions.map((s) => s.id);

  const exerciseLogs = await prisma.exerciseLog.findMany({
    where: { workoutSessionId: { in: sessionIds } },
    select: { exerciseId: true, exerciseName: true },
  });

  const counts = new Map<string, { name: string; count: number }>();

  for (const log of exerciseLogs) {
    const existing = counts.get(log.exerciseId);
    if (existing) {
      existing.count++;
    } else {
      counts.set(log.exerciseId, { name: log.exerciseName, count: 1 });
    }
  }

  const data: ExerciseDistributionItem[] = Array.from(counts.entries())
    .map(([exerciseId, { name, count }]) => ({
      exerciseId,
      exerciseName: name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    range,
    totalSessions: completedSessions.length,
    data,
  };
}

export const exerciseDistributionService = {
  getExerciseDistribution,
};
