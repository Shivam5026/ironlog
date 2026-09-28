import { prisma } from "../../../config/prisma";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import { classifyExercise } from "../../analytics/lib/muscleClassification";
import { getExerciseMuscles } from "../../analytics/lib/muscleClassification";
import { MUSCLE_GROUPS } from "../../analytics/lib/muscleClassification";
import { calculateEstimatedOneRepMax } from "../../analytics/utils/oneRepMax";
import {
  getWeeklyReportCache,
  setWeeklyReportCache,
  getMonthlyReportCache,
  setMonthlyReportCache,
} from "../../analytics/services/cache.service";
import type {
  WeeklyReport,
  MonthlyReport,
  ReportMuscleDistribution,
  ReportPersonalRecord,
} from "../types/report.types";

const repo = new AnalyticsRepository(prisma);

// ── Period Key Helpers ─────────────────────────────────────────────

function getWeekPeriod(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);

  // ISO week number
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const weekNumber = Math.ceil(
    ((d.getTime() - jan4.getTime()) / 86_400_000 + jan4.getUTCDay() + 1) / 7,
  );

  return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getMonthPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// ── Weekly Report Generation (Feature 7.1) ────────────────────────

export async function generateWeeklyReport(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<WeeklyReport> {
  const period = getWeekPeriod(startDate);

  const cached = await getWeeklyReportCache<WeeklyReport>(userId, period);
  if (cached) return cached;

  const dateRange = { startDate, endDate };

  // ── 1. Total Workouts + Duration (reuse 6.1 + 6.3) ──
  const sessions = await repo.getCompletedSessionDurations(userId, dateRange);
  const totalWorkouts = sessions.length;
  const durations = sessions
    .map((s) => s.duration)
    .filter((d): d is number => d != null && d > 0);
  const averageDuration =
    durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

  // ── 2. Total Volume (reuse Epic 2) ──
  const volumeSessions = await repo.getVolumeData(userId, dateRange);
  let totalVolume = 0;
  for (const session of volumeSessions) {
    for (const log of session.exerciseLogs) {
      for (const set of log.sets) {
        totalVolume += Number(set.weight) * set.reps;
      }
    }
  }

  // ── 3. Muscle Distribution (reuse Epic 5) ──
  const sessionsWithExercises = await repo.getSessionsWithExercises(
    userId,
    dateRange,
  );

  // Resolve muscle metadata for all unique exercises
  const uniqueExerciseIds = [
    ...new Set(
      sessionsWithExercises.flatMap((s) => s.exerciseLogs.map((l) => l.exerciseId)),
    ),
  ];
  const exerciseMuscleMap = new Map<
    string,
    { targetMuscles: string[]; bodyParts: string[] }
  >();

  await Promise.all(
    uniqueExerciseIds.map(async (id) => {
      const muscles = await getExerciseMuscles(id);
      exerciseMuscleMap.set(id, muscles);
    }),
  );

  // Count distinct sessions per muscle group
  const muscleSessionCount = new Map<string, Set<string>>();
  for (const session of sessionsWithExercises) {
    const muscleGroupsThisSession = new Set<string>();
    for (const log of session.exerciseLogs) {
      const muscles = exerciseMuscleMap.get(log.exerciseId) ?? {
        targetMuscles: [],
        bodyParts: [],
      };
      const groups = classifyExercise(muscles, log.exerciseName);
      for (const group of groups) {
        muscleGroupsThisSession.add(group);
      }
    }
    for (const muscle of muscleGroupsThisSession) {
      const existing = muscleSessionCount.get(muscle);
      if (existing) {
        existing.add(session.id);
      } else {
        muscleSessionCount.set(muscle, new Set([session.id]));
      }
    }
  }

  const muscleDistribution: ReportMuscleDistribution[] = MUSCLE_GROUPS.map(
    (muscle) => ({
      muscle,
      frequency: muscleSessionCount.get(muscle)?.size ?? 0,
    }),
  ).filter((m) => m.frequency > 0);

  // ── 4. Personal Records achieved in this period ──
  const prRows = await prisma.personalRecord.findMany({
    where: {
      userId,
      achievedAt: { gte: startDate, lte: endDate },
    },
    select: {
      exerciseId: true,
      exerciseName: true,
      bestWeight: true,
      achievedAt: true,
    },
    orderBy: { achievedAt: "desc" },
  });

  const personalRecords: ReportPersonalRecord[] = prRows.map((pr) => ({
    exerciseId: pr.exerciseId,
    exerciseName: pr.exerciseName,
    bestWeight: Number(pr.bestWeight),
    achievedAt: pr.achievedAt.toISOString().split("T")[0],
  }));

  // ── Build Report ──
  const report: WeeklyReport = {
    period: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
    summary: {
      totalWorkouts,
      totalVolume,
      averageDuration,
    },
    muscleDistribution,
    personalRecords,
  };

  await setWeeklyReportCache(userId, period, report);

  return report;
}

// ── Monthly Report Generation (Feature 7.2) ───────────────────────

export async function generateMonthlyReport(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<MonthlyReport> {
  const period = getMonthPeriod(startDate);

  const cached = await getMonthlyReportCache<MonthlyReport>(userId, period);
  if (cached) return cached;

  const dateRange = { startDate, endDate };

  // ── 1. Workout Frequency (reuse 6.1) ──
  const sessions = await repo.getCompletedSessionDurations(userId, dateRange);
  const totalWorkouts = sessions.length;
  const weeksInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 86_400_000)));
  const averagePerWeek = Math.round((totalWorkouts / weeksInPeriod) * 10) / 10;

  // ── 2. Best-Performing Exercises (reuse Epic 3) ──
  const exerciseLogs = await repo.getExerciseProgressData(userId, dateRange);

  // Aggregate by exercise
  const exerciseMap = new Map<string, {
    exerciseName: string;
    bestWeight: number;
    bestVolume: number;
    best1RM: number;
  }>();

  for (const log of exerciseLogs) {
    const existing = exerciseMap.get(log.exerciseId);
    let logBestWeight = 0;
    let logBestVolume = 0;
    let logBest1RM = 0;

    for (const set of log.sets) {
      const weight = Number(set.weight);
      const volume = weight * set.reps;
      const oneRM = calculateEstimatedOneRepMax(weight, set.reps) ?? 0;
      if (weight > logBestWeight) logBestWeight = weight;
      if (volume > logBestVolume) logBestVolume = volume;
      if (oneRM > logBest1RM) logBest1RM = oneRM;
    }

    if (existing) {
      if (logBestWeight > existing.bestWeight) existing.bestWeight = logBestWeight;
      if (logBestVolume > existing.bestVolume) existing.bestVolume = logBestVolume;
      if (logBest1RM > existing.best1RM) existing.best1RM = logBest1RM;
    } else {
      exerciseMap.set(log.exerciseId, {
        exerciseName: log.exerciseName,
        bestWeight: logBestWeight,
        bestVolume: logBestVolume,
        best1RM: logBest1RM,
      });
    }
  }

  const bestPerformingExercises = Array.from(exerciseMap.entries())
    .map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: data.exerciseName,
      bestWeight: data.bestWeight,
      bestVolume: data.bestVolume,
      estimatedOneRepMax: Math.round(data.best1RM * 100) / 100,
    }))
    .sort((a, b) => b.estimatedOneRepMax - a.estimatedOneRepMax);

  // ── 3. Body Weight Trend ──
  const bodyWeights = await repo.getBodyWeights(userId, dateRange);
  const bwData = bodyWeights.map((bw) => ({
    date: bw.recordedAt.toISOString().split("T")[0],
    weight: Number(bw.weight),
  }));

  const startWeight = bwData.length > 0 ? bwData[0].weight : 0;
  const endWeight = bwData.length > 0 ? bwData[bwData.length - 1].weight : 0;
  const bodyWeightChange = Math.round((endWeight - startWeight) * 100) / 100;

  // ── 4. Overall Progress ──
  // Total volume
  const volumeSessions = await repo.getVolumeData(userId, dateRange);
  let totalVolume = 0;
  for (const session of volumeSessions) {
    for (const log of session.exerciseLogs) {
      for (const set of log.sets) {
        totalVolume += Number(set.weight) * set.reps;
      }
    }
  }

  // Previous month volume for comparison
  const prevMonthStart = new Date(startDate);
  prevMonthStart.setUTCMonth(prevMonthStart.getUTCMonth() - 1);
  const prevMonthEnd = new Date(startDate);
  prevMonthEnd.setUTCDate(prevMonthEnd.getUTCDate() - 1);

  const prevVolumeSessions = await repo.getVolumeData(userId, {
    startDate: prevMonthStart,
    endDate: prevMonthEnd,
  });
  let prevTotalVolume = 0;
  for (const session of prevVolumeSessions) {
    for (const log of session.exerciseLogs) {
      for (const set of log.sets) {
        prevTotalVolume += Number(set.weight) * set.reps;
      }
    }
  }

  const volumeChange = prevTotalVolume > 0
    ? Math.round(((totalVolume - prevTotalVolume) / prevTotalVolume) * 1000) / 10
    : 0;

  // Average duration
  const durations = sessions
    .map((s) => s.duration)
    .filter((d): d is number => d != null && d > 0);
  const averageWorkoutDuration =
    durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

  // ── Build Report ──
  const report: MonthlyReport = {
    period: {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    },
    workoutFrequency: {
      totalWorkouts,
      averagePerWeek,
    },
    bestPerformingExercises,
    bodyWeightTrend: {
      startWeight,
      endWeight,
      change: bodyWeightChange,
      data: bwData,
    },
    overallProgress: {
      totalVolume,
      volumeChange,
      totalWorkouts,
      averageWorkoutDuration,
    },
  };

  await setMonthlyReportCache(userId, period, report);

  return report;
}
