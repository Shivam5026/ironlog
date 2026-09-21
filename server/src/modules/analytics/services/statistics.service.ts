import { prisma } from "../../../config/prisma";
import type { Statistics } from "../types/analytics.types";

function calculateWeekSpan(sessions: { startedAt: Date; endedAt: Date | null }[]): number {
  if (sessions.length === 0) return 0;

  const dates = sessions
    .map((s) => s.endedAt ?? s.startedAt)
    .sort((a, b) => a.getTime() - b.getTime());

  const first = dates[0];
  const last = dates[dates.length - 1];
  const msDiff = last.getTime() - first.getTime();
  const days = msDiff / (1000 * 60 * 60 * 24);
  const weeks = Math.max(1, Math.ceil(days / 7));

  return weeks;
}

async function getStatistics(userId: string): Promise<Statistics> {
  const completedSessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    select: { id: true, startedAt: true, endedAt: true, duration: true },
    orderBy: { startedAt: "asc" },
  });

  if (completedSessions.length === 0) {
    return {
      totalVolume: 0,
      totalSets: 0,
      totalReps: 0,
      averageWorkoutDuration: 0,
      averageWeeklyFrequency: 0,
    };
  }

  const sessionIds = completedSessions.map((s) => s.id);

  const completedSets = await prisma.exerciseLogSet.findMany({
    where: {
      completed: true,
      exerciseLog: { workoutSessionId: { in: sessionIds } },
    },
    select: { weight: true, reps: true },
  });

  let totalVolume = 0;
  let totalSets = 0;
  let totalReps = 0;

  for (const set of completedSets) {
    totalSets++;
    totalReps += set.reps;
    totalVolume += Number(set.weight) * set.reps;
  }

  // Average duration: use stored duration if available, else compute from startedAt/endedAt
  let totalDurationMs = 0;
  let durationCount = 0;

  for (const session of completedSessions) {
    if (session.duration && session.duration > 0) {
      totalDurationMs += session.duration * 1000;
      durationCount++;
    } else if (session.endedAt) {
      totalDurationMs += session.endedAt.getTime() - session.startedAt.getTime();
      durationCount++;
    }
  }

  const averageWorkoutDuration =
    durationCount > 0 ? Math.round(totalDurationMs / durationCount / 60000) : 0;

  // Average weekly frequency
  const weekSpan = calculateWeekSpan(completedSessions);
  const averageWeeklyFrequency =
    weekSpan > 0
      ? Math.round((completedSessions.length / weekSpan) * 10) / 10
      : 0;

  return {
    totalVolume: Math.round(totalVolume),
    totalSets,
    totalReps,
    averageWorkoutDuration,
    averageWeeklyFrequency,
  };
}

export const statisticsService = {
  getStatistics,
};
