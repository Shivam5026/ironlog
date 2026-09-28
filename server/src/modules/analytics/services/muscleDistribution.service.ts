import { prisma } from "../../../config/prisma";
import type {
  AnalyticsRange,
  MuscleDistributionItem,
  MuscleDistributionResponse,
} from "../types/analytics.types";
import {
  MUSCLE_GROUPS,
  type MuscleGroup,
  getExerciseMuscles,
  classifyExercise,
} from "../lib/muscleClassification";

const MS_PER_DAY = 86_400_000;

function getRangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * MS_PER_DAY);
}

async function getMuscleDistribution(
  userId: string,
  range: AnalyticsRange = "all",
): Promise<MuscleDistributionResponse> {
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

  const uniqueExerciseIds = [...new Set(exerciseLogs.map((l) => l.exerciseId))];

  const exerciseMuscles = new Map<
    string,
    { targetMuscles: string[]; bodyParts: string[] }
  >();

  await Promise.all(
    uniqueExerciseIds.map(async (id) => {
      const muscles = await getExerciseMuscles(id);
      exerciseMuscles.set(id, muscles);
    }),
  );

  const muscleCounts = new Map<MuscleGroup, number>();

  for (const log of exerciseLogs) {
    const muscles = exerciseMuscles.get(log.exerciseId);
    if (!muscles) continue;

    const groups = classifyExercise(muscles, log.exerciseName);
    for (const group of groups) {
      muscleCounts.set(group, (muscleCounts.get(group) ?? 0) + 1);
    }
  }

  const data: MuscleDistributionItem[] = MUSCLE_GROUPS.map((group) => ({
    muscle: group,
    count: muscleCounts.get(group) ?? 0,
  })).filter((item) => item.count > 0);

  data.sort((a, b) => b.count - a.count);

  return {
    range,
    totalSessions: completedSessions.length,
    data,
  };
}

export const muscleDistributionService = {
  getMuscleDistribution,
};
