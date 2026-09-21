import { prisma } from "../../../config/prisma";
import { withCache } from "../../../lib/cache";
import { getExerciseById } from "../../exercise/exerciseDb.service";
import type {
  AnalyticsRange,
  MuscleDistributionItem,
  MuscleDistributionResponse,
} from "../types/analytics.types";

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const MS_PER_DAY = 86_400_000;

const MUSCLE_CATEGORIES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
] as const;

type MuscleCategory = (typeof MUSCLE_CATEGORIES)[number];

const MUSCLE_TO_CATEGORY: Record<string, MuscleCategory> = {
  // Chest
  pectorals: "Chest",
  chest: "Chest",

  // Back
  lats: "Back",
  "upper back": "Back",
  "middle back": "Back",
  "lower back": "Back",
  traps: "Back",
  rhomboids: "Back",

  // Legs
  quadriceps: "Legs",
  hamstrings: "Legs",
  glutes: "Legs",
  calves: "Legs",
  "upper legs": "Legs",
  "lower legs": "Legs",
  hip: "Legs",
  "hip flexors": "Legs",
  adductors: "Legs",
  abductors: "Legs",

  // Shoulders
  deltoids: "Shoulders",
  shoulders: "Shoulders",
  rotator: "Shoulders",

  // Arms
  biceps: "Arms",
  triceps: "Arms",
  forearms: "Arms",
  "upper arms": "Arms",
  brachialis: "Arms",
  brachioradialis: "Arms",

  // Core
  abdominals: "Core",
  abs: "Core",
  obliques: "Core",
  waist: "Core",
  "serratus anterior": "Core",
};

function mapMuscleToCategory(muscle: string): MuscleCategory | null {
  const normalized = muscle.toLowerCase().trim();
  return MUSCLE_TO_CATEGORY[normalized] ?? null;
}

function getRangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * MS_PER_DAY);
}

async function getExerciseMuscles(
  exerciseId: string,
): Promise<{ targetMuscles: string[]; bodyParts: string[] }> {
  return withCache(
    `exercise:muscles:${exerciseId}`,
    async () => {
      try {
        const exercise = await getExerciseById(exerciseId);
        return {
          targetMuscles: exercise.targetMuscles ?? [],
          bodyParts: exercise.bodyParts ?? [],
        };
      } catch {
        return { targetMuscles: [], bodyParts: [] };
      }
    },
    CACHE_TTL,
  );
}

function categorizeExercise(muscles: {
  targetMuscles: string[];
  bodyParts: string[];
}): Set<MuscleCategory> {
  const categories = new Set<MuscleCategory>();

  for (const muscle of muscles.targetMuscles) {
    const cat = mapMuscleToCategory(muscle);
    if (cat) categories.add(cat);
  }

  if (categories.size === 0) {
    for (const part of muscles.bodyParts) {
      const cat = mapMuscleToCategory(part);
      if (cat) categories.add(cat);
    }
  }

  return categories;
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
    select: { exerciseId: true },
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

  const muscleCounts = new Map<MuscleCategory, number>();

  for (const log of exerciseLogs) {
    const muscles = exerciseMuscles.get(log.exerciseId);
    if (!muscles) continue;

    const categories = categorizeExercise(muscles);
    for (const cat of categories) {
      muscleCounts.set(cat, (muscleCounts.get(cat) ?? 0) + 1);
    }
  }

  const data: MuscleDistributionItem[] = MUSCLE_CATEGORIES.map((cat) => ({
    muscle: cat,
    count: muscleCounts.get(cat) ?? 0,
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
