import { prisma } from "../../../config/prisma";
import { withCache } from "../../../lib/cache";
import { ApiError } from "../../../utils/ApiError";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { calculateEstimatedOneRepMax } from "../utils/oneRepMax";
import { volumeService } from "./volume.service";
import { frequencyService } from "./frequency.service";
import { exerciseDistributionService } from "./exerciseDistribution.service";
import { muscleDistributionService } from "./muscleDistribution.service";
import { statisticsService } from "./statistics.service";
import { invalidateUserAnalytics } from "./cache.service";
import type {
  AnalyticsDateRange,
  AnalyticsOptions,
  AnalyticsResponse,
  AnalyticsRange,
  Statistics,
  VolumeAnalytics,
  VolumeAnalyticsResponse,
  WorkoutFrequencyResponse,
  ExerciseDistributionResponse,
  MuscleDistributionResponse,
  ExerciseVolumeResponse,
  ExerciseVolumeAnalytics,
  MuscleGroupVolumeResponse,
  ProgressTrends,
  ExerciseOneRepMaxTrend,
  ExerciseProgressMetricsItem,
  ExerciseProgressMetricsResponse,
  VolumeComparisonResponse,
  MuscleFrequencyRange,
  MuscleFrequencyResponse,
  MuscleBalanceResponse,
  MuscleHeatmapResponse,
  HeatmapDataPoint,
  ConsistencyRange,
  ConsistencyResponse,
  StreakAnalysis,
  DurationAnalysis,
} from "../types/analytics.types";
import {
  MUSCLE_GROUPS,
  type MuscleGroup,
  getExerciseMuscles,
  classifyExercise,
} from "../lib/muscleClassification";

// ── Cache keys & TTL ──────────────────────────────────────────────

const CACHE_PREFIX = "analytics";
const CACHE_TTL = 300; // 5 minutes

function cacheKey(userId: string, segment: string, range?: string): string {
  return range
    ? `${CACHE_PREFIX}:${userId}:${segment}:${range}`
    : `${CACHE_PREFIX}:${userId}:${segment}`;
}

// ── Cache abstraction ──────────────────────────────────────────────

async function cached<T>(
  userId: string,
  segment: string,
  range: AnalyticsRange | undefined,
  fetcher: () => Promise<T>,
): Promise<T> {
  return withCache(cacheKey(userId, segment, range), fetcher, CACHE_TTL);
}

// ── Date period helpers ────────────────────────────────────────────

/** ISO week period: "2026-W36" (Mon–Sun) */
function getWeekPeriod(date: Date): string {
  const d = new Date(date);
  // Adjust to Monday-based week
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0, Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Month period: "2026-09" */
function getMonthPeriod(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Date key: "2026-09-22" */
function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

/** Add days to a date key, returning a new date key */
function addDaysToDateKey(key: string, days: number): string {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

/** Compute streak analysis from active dates within a range */
function computeStreakAnalysis(
  activeDates: Set<string>,
  dateRange: AnalyticsDateRange,
): StreakAnalysis {
  const msPerDay = 86_400_000;

  // Determine range boundaries
  const end = dateRange.endDate ?? new Date();
  const start = dateRange.startDate ?? new Date(end.getTime() - 30 * msPerDay);

  const rangeStart = toDateKey(start);
  const rangeEnd = toDateKey(end);

  // Collect all dates in range
  const allDates: string[] = [];
  let cursor = new Date(start);
  while (toDateKey(cursor) <= rangeEnd) {
    allDates.push(toDateKey(cursor));
    cursor = new Date(cursor.getTime() + msPerDay);
  }

  const totalDays = allDates.length;

  // Active days in range
  const activeDaysInRange = allDates.filter((d) => activeDates.has(d)).length;
  const missedDays = totalDays - activeDaysInRange;

  // Compute longest streak (scan all dates)
  let longestStreak = 0;
  let currentRun = 0;
  for (const date of allDates) {
    if (activeDates.has(date)) {
      currentRun++;
      if (currentRun > longestStreak) longestStreak = currentRun;
    } else {
      currentRun = 0;
    }
  }

  // Compute current streak (consecutive active days ending at latest active day)
  // If today has no workout, check if yesterday was active (don't break streak automatically)
  let currentStreak = 0;
  const today = toDateKey(new Date());
  const yesterday = addDaysToDateKey(today, -1);

  // Start from the most recent active date that's within range
  const sortedActive = allDates.filter((d) => activeDates.has(d)).sort().reverse();
  if (sortedActive.length > 0) {
    const latestActive = sortedActive[0];

    // If latest active is before yesterday, streak is broken
    // If latest active is today or yesterday, count backwards
    if (latestActive === today || latestActive === yesterday) {
      let streakDate = latestActive;
      while (activeDates.has(streakDate)) {
        currentStreak++;
        streakDate = addDaysToDateKey(streakDate, -1);
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    activeDays: activeDaysInRange,
    missedDays,
    range: { start: rangeStart, end: rangeEnd },
  };
}

/** Compute duration analysis from an array of durations (in minutes) */
function computeDurationAnalysis(durations: number[]): DurationAnalysis {
  if (durations.length === 0) {
    return {
      averageDuration: 0,
      longestDuration: 0,
      shortestDuration: 0,
      totalWorkouts: 0,
      unit: "minutes",
    };
  }

  const total = durations.reduce((sum, d) => sum + d, 0);
  const average = Math.round(total / durations.length);
  const longest = Math.max(...durations);
  const shortest = Math.min(...durations);

  return {
    averageDuration: average,
    longestDuration: longest,
    shortestDuration: shortest,
    totalWorkouts: durations.length,
    unit: "minutes",
  };
}

// ── Response wrapper ───────────────────────────────────────────────

function wrap<T>(
  data: T,
  options?: AnalyticsOptions,
  effectiveRange?: AnalyticsRange,
): AnalyticsResponse<T> {
  const meta: AnalyticsResponse<T>["meta"] = {};

  const range = options?.range ?? effectiveRange;
  if (range) {
    meta.range = range;
  }
  if (options?.startDate) {
    meta.startDate = options.startDate.toISOString();
  }
  if (options?.endDate) {
    meta.endDate = options.endDate.toISOString();
  }

  return { data, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

// ── Range → DateRange conversion ────────────────────────────────────

const MS_PER_DAY = 86_400_000;

function rangeToDateRange(range: AnalyticsRange): AnalyticsDateRange {
  if (range === "all") return {};
  const days = range === "7d" ? 7 : 30;
  return { startDate: new Date(Date.now() - days * MS_PER_DAY) };
}

// ── Date formatting helpers (UTC) ───────────────────────────────────

function getWeekKey(date: Date): string {
  const d = new Date(date.getTime());
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  return `${d.getUTCFullYear()}-W${String(Math.ceil((d.getUTCDate() + new Date(d.getUTCFullYear(), 0, 1).getUTCDay()) / 7)).padStart(2, "0")}`;
}

function getMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Analytics Service ──────────────────────────────────────────────

export class AnalyticsService {
  readonly repository: AnalyticsRepository;

  constructor(repository?: AnalyticsRepository) {
    this.repository = repository ?? new AnalyticsRepository(prisma);
  }

  // ── Orchestrator methods ─────────────────────────────────────────

  async getStatistics(
    userId: string,
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<Statistics>> {
    const data = await cached(userId, "statistics", options?.range, () =>
      statisticsService.getStatistics(userId),
    );
    return wrap(data, options, options?.range);
  }

  async getVolumeAnalytics(
    userId: string,
    range: AnalyticsRange = "30d",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<VolumeAnalytics>> {
    const effectiveRange = options?.range ?? range;
    const baseRange = rangeToDateRange(effectiveRange);

    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? baseRange.startDate,
      endDate: options?.endDate ?? baseRange.endDate,
    };

    const data = await cached(userId, "volume-v2", effectiveRange, () =>
      this.computeVolumeAnalytics(userId, dateRange),
    );

    return wrap(data, options, effectiveRange);
  }

  private async computeVolumeAnalytics(
    userId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<VolumeAnalytics> {
    const sessions = await this.repository.getVolumeData(userId, dateRange);

    // Per-workout volume
    const workoutVolumes = sessions.map((session) => {
      const volume = session.exerciseLogs.reduce(
        (exerciseTotal: number, log: { sets: { weight: unknown; reps: number }[] }) =>
          exerciseTotal +
          log.sets.reduce(
            (setTotal: number, set: { weight: unknown; reps: number }) =>
              setTotal + Number(set.weight) * set.reps,
            0,
          ),
        0,
      );

      return {
        workoutSessionId: session.id,
        date: toDateKey(session.endedAt!),
        volume: Math.round(volume),
      };
    });

    // Daily volume (aggregate same-day workouts)
    const dailyMap = new Map<string, number>();
    for (const wv of workoutVolumes) {
      dailyMap.set(wv.date, (dailyMap.get(wv.date) ?? 0) + wv.volume);
    }
    const daily = Array.from(dailyMap.entries())
      .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weekly volume
    const weeklyMap = new Map<string, number>();
    for (const wv of workoutVolumes) {
      const weekKey = getWeekKey(new Date(wv.date));
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + wv.volume);
    }
    const weekly = Array.from(weeklyMap.entries())
      .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Monthly volume
    const monthlyMap = new Map<string, number>();
    for (const wv of workoutVolumes) {
      const monthKey = getMonthKey(new Date(wv.date));
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + wv.volume);
    }
    const monthly = Array.from(monthlyMap.entries())
      .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { workout: workoutVolumes, daily, weekly, monthly };
  }

  // ── Exercise Volume (Feature 2.2) ─────────────────────────────────

  async getExerciseVolumeAnalytics(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<ExerciseVolumeResponse>> {
    const effectiveRange = options?.range ?? range;
    const baseRange = rangeToDateRange(effectiveRange);

    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? baseRange.startDate,
      endDate: options?.endDate ?? baseRange.endDate,
    };

    const data = await cached(userId, "exercise-volume", effectiveRange, () =>
      this.computeExerciseVolumeAnalytics(userId, dateRange),
    );

    return wrap(data, options, effectiveRange);
  }

  private async computeExerciseVolumeAnalytics(
    userId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<ExerciseVolumeResponse> {
    const logs = await this.repository.getExerciseVolumeData(userId, dateRange);

    // Group by exerciseId
    const exerciseMap = new Map<
      string,
      {
        exerciseName: string;
        totalVolume: number;
        trendMap: Map<string, number>;
      }
    >();

    for (const log of logs) {
      const existing = exerciseMap.get(log.exerciseId);
      const logVolume = log.sets.reduce(
        (sum: number, set: { weight: unknown; reps: number }) =>
          sum + Number(set.weight) * set.reps,
        0,
      );

      if (existing) {
        existing.totalVolume += logVolume;
        const dateKey = toDateKey(log.workoutSession.endedAt!);
        existing.trendMap.set(
          dateKey,
          (existing.trendMap.get(dateKey) ?? 0) + logVolume,
        );
      } else {
        const trendMap = new Map<string, number>();
        const dateKey = toDateKey(log.workoutSession.endedAt!);
        trendMap.set(dateKey, logVolume);
        exerciseMap.set(log.exerciseId, {
          exerciseName: log.exerciseName,
          totalVolume: logVolume,
          trendMap,
        });
      }
    }

    // Convert to arrays, sorted by totalVolume desc
    const exercises: ExerciseVolumeAnalytics[] = Array.from(exerciseMap.entries())
      .map(([exerciseId, { exerciseName, totalVolume, trendMap }]) => ({
        exerciseId,
        exerciseName,
        totalVolume: Math.round(totalVolume),
        trend: Array.from(trendMap.entries())
          .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);

    const highestVolumeExercises = exercises.map(({ exerciseId, exerciseName, totalVolume }) => ({
      exerciseId,
      exerciseName,
      totalVolume,
    }));

    return { exercises, highestVolumeExercises };
  }

  // ── Muscle Group Volume (Feature 2.3) ─────────────────────────────

  async getMuscleGroupVolumeAnalytics(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<MuscleGroupVolumeResponse>> {
    const effectiveRange = options?.range ?? range;
    const baseRange = rangeToDateRange(effectiveRange);

    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? baseRange.startDate,
      endDate: options?.endDate ?? baseRange.endDate,
    };

    const data = await cached(userId, "muscle-group-volume", effectiveRange, () =>
      this.computeMuscleGroupVolumeAnalytics(userId, dateRange),
    );

    return wrap(data, options, effectiveRange);
  }

  private async computeMuscleGroupVolumeAnalytics(
    userId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<MuscleGroupVolumeResponse> {
    const logs = await this.repository.getExerciseVolumeData(userId, dateRange);

    // Resolve muscle metadata for all unique exercises
    const uniqueExerciseIds = [...new Set(logs.map((l) => l.exerciseId))];
    const exerciseMuscleMap = new Map<string, { targetMuscles: string[]; bodyParts: string[] }>();

    await Promise.all(
      uniqueExerciseIds.map(async (id) => {
        const muscles = await getExerciseMuscles(id);
        exerciseMuscleMap.set(id, muscles);
      }),
    );

    // Build a name lookup for fallback classification
    const exerciseNameMap = new Map<string, string>();
    for (const log of logs) {
      exerciseNameMap.set(log.exerciseId, log.exerciseName);
    }

    // Calculate volume per exercise, then aggregate by muscle group
    const muscleVolume = new Map<MuscleGroup, number>();

    for (const log of logs) {
      const muscles = exerciseMuscleMap.get(log.exerciseId) ?? { targetMuscles: [], bodyParts: [] };
      const groups = classifyExercise(muscles, log.exerciseName);
      if (groups.size === 0) continue;

      const logVolume = log.sets.reduce(
        (sum: number, set: { weight: unknown; reps: number }) =>
          sum + Number(set.weight) * set.reps,
        0,
      );

      for (const group of groups) {
        muscleVolume.set(group, (muscleVolume.get(group) ?? 0) + logVolume);
      }
    }

    // Return all six groups (zero for untrained)
    return MUSCLE_GROUPS.map((group) => ({
      muscleGroup: group,
      volume: Math.round(muscleVolume.get(group) ?? 0),
    }));
  }

  // ── Progress Trends (Feature 3.1) ─────────────────────────────────

  async getProgressTrends(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<ProgressTrends>> {
    const effectiveRange = options?.range ?? range;
    const baseRange = rangeToDateRange(effectiveRange);

    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? baseRange.startDate,
      endDate: options?.endDate ?? baseRange.endDate,
    };

    const data = await cached(userId, "progress-trends", effectiveRange, () =>
      this.computeProgressTrends(userId, dateRange),
    );

    return wrap(data, options, effectiveRange);
  }

  private async computeProgressTrends(
    userId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<ProgressTrends> {
    // Fetch workout + body weight data in parallel
    const [sessions, bodyWeights] = await Promise.all([
      this.repository.getVolumeData(userId, dateRange),
      this.repository.getBodyWeights(userId, dateRange),
    ]);

    // ── Weekly volume ─────────────────────────────────────────────
    const weeklyMap = new Map<string, number>();
    for (const session of sessions) {
      const volume = session.exerciseLogs.reduce(
        (et: number, log: { sets: { weight: unknown; reps: number }[] }) =>
          et + log.sets.reduce(
            (st: number, set: { weight: unknown; reps: number }) =>
              st + Number(set.weight) * set.reps,
            0,
          ),
        0,
      );
      const weekKey = getWeekKey(session.endedAt!);
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + volume);
    }
    const weekly = Array.from(weeklyMap.entries())
      .map(([period, value]) => ({ period, value: Math.round(value) }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // ── Monthly volume ────────────────────────────────────────────
    const monthlyMap = new Map<string, number>();
    for (const session of sessions) {
      const volume = session.exerciseLogs.reduce(
        (et: number, log: { sets: { weight: unknown; reps: number }[] }) =>
          et + log.sets.reduce(
            (st: number, set: { weight: unknown; reps: number }) =>
              st + Number(set.weight) * set.reps,
            0,
          ),
        0,
      );
      const monthKey = getMonthKey(session.endedAt!);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + volume);
    }
    const monthly = Array.from(monthlyMap.entries())
      .map(([period, value]) => ({ period, value: Math.round(value) }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // ── Exercise progression ──────────────────────────────────────
    const exerciseMap = new Map<
      string,
      { exerciseName: string; trendMap: Map<string, number> }
    >();
    for (const session of sessions) {
      const dateKey = toDateKey(session.endedAt!);
      for (const log of session.exerciseLogs) {
        const logVolume = log.sets.reduce(
          (sum: number, set: { weight: unknown; reps: number }) =>
            sum + Number(set.weight) * set.reps,
          0,
        );
        const existing = exerciseMap.get(log.exerciseId);
        if (existing) {
          existing.trendMap.set(
            dateKey,
            (existing.trendMap.get(dateKey) ?? 0) + logVolume,
          );
        } else {
          const trendMap = new Map<string, number>();
          trendMap.set(dateKey, logVolume);
          exerciseMap.set(log.exerciseId, {
            exerciseName: log.exerciseName,
            trendMap,
          });
        }
      }
    }
    const exercises = Array.from(exerciseMap.entries())
      .map(([exerciseId, { exerciseName, trendMap }]) => ({
        exerciseId,
        exerciseName,
        trend: Array.from(trendMap.entries())
          .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => b.trend.reduce((s, t) => s + t.volume, 0) - a.trend.reduce((s, t) => s + t.volume, 0));

    // ── Body-weight progression ───────────────────────────────────
    const bodyWeight = bodyWeights.map((bw) => ({
      period: toDateKey(bw.recordedAt),
      value: Number(bw.weight),
    }));

    // ── One Rep Max trends (Feature 3.2) ──────────────────────────
    const oneRepMaxMap = new Map<
      string,
      { exerciseName: string; dateMap: Map<string, number> }
    >();

    for (const session of sessions) {
      const dateKey = toDateKey(session.endedAt!);
      for (const log of session.exerciseLogs) {
        for (const set of log.sets) {
          const e1rm = calculateEstimatedOneRepMax(
            Number(set.weight),
            set.reps,
          );
          if (e1rm === null) continue;

          const existing = oneRepMaxMap.get(log.exerciseId);
          if (existing) {
            const current = existing.dateMap.get(dateKey) ?? 0;
            if (e1rm > current) {
              existing.dateMap.set(dateKey, e1rm);
            }
          } else {
            const dateMap = new Map<string, number>();
            dateMap.set(dateKey, e1rm);
            oneRepMaxMap.set(log.exerciseId, {
              exerciseName: log.exerciseName,
              dateMap,
            });
          }
        }
      }
    }

    const oneRepMax = Array.from(oneRepMaxMap.entries())
      .map(([exerciseId, { exerciseName, dateMap }]) => ({
        exerciseId,
        exerciseName,
        trend: Array.from(dateMap.entries())
          .map(([date, estimatedOneRepMax]) => ({
            date,
            estimatedOneRepMax: Math.round(estimatedOneRepMax * 100) / 100,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort(
        (a, b) =>
          (b.trend[b.trend.length - 1]?.estimatedOneRepMax ?? 0) -
          (a.trend[a.trend.length - 1]?.estimatedOneRepMax ?? 0),
      );

    return { weekly, monthly, exercises, bodyWeight, oneRepMax };
  }

  async getWorkoutFrequency(
    userId: string,
    range: AnalyticsRange = "30d",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<WorkoutFrequencyResponse>> {
    const effectiveRange = options?.range ?? range;
    const data = await cached(userId, "frequency", effectiveRange, () =>
      frequencyService.getWorkoutFrequency(userId, effectiveRange),
    );
    return wrap(data, options, effectiveRange);
  }

  // ── Exercise Progress Metrics (Feature 3.3) ─────────────────────

  async getExerciseProgressMetrics(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<ExerciseProgressMetricsResponse>> {
    const effectiveRange = options?.range ?? range;
    const baseRange = rangeToDateRange(effectiveRange);

    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? baseRange.startDate,
      endDate: options?.endDate ?? baseRange.endDate,
    };

    const data = await cached(userId, "exercise-progress", effectiveRange, () =>
      this.computeExerciseProgressMetrics(userId, dateRange),
    );

    return wrap(data, options, effectiveRange);
  }

  private async computeExerciseProgressMetrics(
    userId: string,
    dateRange: AnalyticsDateRange,
  ): Promise<ExerciseProgressMetricsResponse> {
    const logs = await this.repository.getExerciseProgressData(userId, dateRange);

    interface ExerciseAgg {
      exerciseName: string;
      bestWeight: number;
      bestVolumePerWorkout: number;
      workoutVolumeMap: Map<string, number>;
      totalReps: number;
      totalWeight: number;
      setCount: number;
    }

    const exerciseMap = new Map<string, ExerciseAgg>();

    for (const log of logs) {
      const existing = exerciseMap.get(log.exerciseId);

      if (existing) {
        // Keep the latest exercise name
        existing.exerciseName = log.exerciseName;
      } else {
        exerciseMap.set(log.exerciseId, {
          exerciseName: log.exerciseName,
          bestWeight: 0,
          bestVolumePerWorkout: 0,
          workoutVolumeMap: new Map(),
          totalReps: 0,
          totalWeight: 0,
          setCount: 0,
        });
      }

      const agg = exerciseMap.get(log.exerciseId)!;
      const sessionId = log.workoutSession.id;
      let sessionVolume = 0;

      for (const set of log.sets) {
        const weight = Number(set.weight);
        const reps = set.reps;

        agg.bestWeight = Math.max(agg.bestWeight, weight);
        agg.totalReps += reps;
        agg.totalWeight += weight;
        agg.setCount += 1;

        sessionVolume += weight * reps;
      }

      const prev = agg.workoutVolumeMap.get(sessionId) ?? 0;
      agg.workoutVolumeMap.set(sessionId, prev + sessionVolume);
    }

    const exercises: ExerciseProgressMetricsItem[] = Array.from(exerciseMap.entries())
      .map(([exerciseId, agg]) => {
        let bestVolume = 0;
        for (const vol of agg.workoutVolumeMap.values()) {
          if (vol > bestVolume) bestVolume = vol;
        }
        return {
          exerciseId,
          exerciseName: agg.exerciseName,
          bestWeight: agg.bestWeight,
          bestVolume: Math.round(bestVolume),
          averageReps: agg.setCount > 0 ? Math.round((agg.totalReps / agg.setCount) * 100) / 100 : 0,
          averageWeight: agg.setCount > 0 ? Math.round((agg.totalWeight / agg.setCount) * 100) / 100 : 0,
        };
      })
      .sort((a, b) => b.bestWeight - a.bestWeight);

    return { exercises };
  }

  async getExerciseDistribution(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<ExerciseDistributionResponse>> {
    const effectiveRange = options?.range ?? range;
    const data = await cached(userId, "exercise-distribution", effectiveRange, () =>
      exerciseDistributionService.getExerciseDistribution(userId, effectiveRange),
    );
    return wrap(data, options, effectiveRange);
  }

  async getMuscleDistribution(
    userId: string,
    range: AnalyticsRange = "all",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<MuscleDistributionResponse>> {
    const effectiveRange = options?.range ?? range;
    const data = await cached(userId, "muscle-distribution", effectiveRange, () =>
      muscleDistributionService.getMuscleDistribution(userId, effectiveRange),
    );
    return wrap(data, options, effectiveRange);
  }

  // ── Muscle Frequency (Feature 5.1) ──────────────────────────────

  async getMuscleFrequency(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange = "weekly",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<MuscleFrequencyResponse>> {
    // Determine date range based on frequency type
    const msPerDay = 86_400_000;
    const days = muscleFrequencyRange === "weekly" ? 7 : 30;
    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? new Date(Date.now() - days * msPerDay),
      endDate: options?.endDate,
    };

    const cacheKey = `muscle-frequency-${muscleFrequencyRange}`;
    const data = await cached(userId, cacheKey, undefined, () =>
      this.computeMuscleFrequency(userId, muscleFrequencyRange, dateRange),
    );

    return wrap(data, options, undefined);
  }

  private async computeMuscleFrequency(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange,
    dateRange: AnalyticsDateRange,
  ): Promise<MuscleFrequencyResponse> {
    const sessions = await this.repository.getSessionsWithExercises(
      userId,
      dateRange,
    );

    // Resolve muscle metadata for all unique exercises
    const uniqueExerciseIds = [
      ...new Set(
        sessions.flatMap((s) => s.exerciseLogs.map((l) => l.exerciseId)),
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

    // Build a name lookup for fallback classification
    const exerciseNameMap = new Map<string, string>();
    for (const session of sessions) {
      for (const log of session.exerciseLogs) {
        exerciseNameMap.set(log.exerciseId, log.exerciseName);
      }
    }

    // Count distinct sessions per muscle group
    const muscleSessionCount = new Map<string, Set<string>>();

    for (const session of sessions) {
      const sessionId = session.id;
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

      // Each muscle group gets counted once per session
      for (const muscle of muscleGroupsThisSession) {
        const existing = muscleSessionCount.get(muscle);
        if (existing) {
          existing.add(sessionId);
        } else {
          muscleSessionCount.set(muscle, new Set([sessionId]));
        }
      }
    }

    // Convert to response format
    const data = MUSCLE_GROUPS.map((muscle) => ({
      muscle,
      frequency: muscleSessionCount.get(muscle)?.size ?? 0,
    }));

    return { range: muscleFrequencyRange, data };
  }

  // ── Muscle Balance (Feature 5.2) ────────────────────────────────

  async getMuscleBalance(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange = "weekly",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<MuscleBalanceResponse>> {
    const cacheKey = `muscle-balance-${muscleFrequencyRange}`;
    const data = await cached(userId, cacheKey, undefined, () =>
      this.computeMuscleBalance(userId, muscleFrequencyRange, options),
    );
    return wrap(data, options, undefined);
  }

  private async computeMuscleBalance(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange,
    options?: AnalyticsOptions,
  ): Promise<MuscleBalanceResponse> {
    // Reuse 5.1 frequency computation
    const frequencyResult = await this.getMuscleFrequency(
      userId,
      muscleFrequencyRange,
      options,
    );

    const { data: muscleFreqs } = frequencyResult.data;

    // Calculate average frequency
    const totalFreq = muscleFreqs.reduce((sum, m) => sum + m.frequency, 0);
    const avgFreq = totalFreq / muscleFreqs.length;

    // Thresholds (implementation choices, not roadmap requirements)
    const OVERTRAIN_RATIO = 1.25;
    const UNDERTRAIN_RATIO = 0.75;

    const muscles = muscleFreqs.map(({ muscle, frequency }) => {
      let status: "OVERTRAINED" | "BALANCED" | "UNDERTRAINED";
      if (avgFreq === 0) {
        // No data → all balanced (don't mark everything undertrained)
        status = "BALANCED";
      } else if (frequency > avgFreq * OVERTRAIN_RATIO) {
        status = "OVERTRAINED";
      } else if (frequency < avgFreq * UNDERTRAIN_RATIO) {
        status = "UNDERTRAINED";
      } else {
        status = "BALANCED";
      }
      return { muscle, frequency, status };
    });

    return {
      range: muscleFrequencyRange,
      averageFrequency: Math.round(avgFreq * 100) / 100,
      muscles,
    };
  }

  // ── Training Heatmap (Feature 5.3) ──────────────────────────────

  async getMuscleHeatmap(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange = "weekly",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<MuscleHeatmapResponse>> {
    const cacheKey = `muscle-heatmap-${muscleFrequencyRange}`;
    const data = await cached(userId, cacheKey, undefined, () =>
      this.computeMuscleHeatmap(userId, muscleFrequencyRange, options),
    );
    return wrap(data, options, undefined);
  }

  private async computeMuscleHeatmap(
    userId: string,
    muscleFrequencyRange: MuscleFrequencyRange,
    options?: AnalyticsOptions,
  ): Promise<MuscleHeatmapResponse> {
    // Determine date range
    const msPerDay = 86_400_000;
    const days = muscleFrequencyRange === "weekly" ? 7 : 30;
    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? new Date(Date.now() - days * msPerDay),
      endDate: options?.endDate,
    };

    const sessions = await this.repository.getSessionsWithExercises(
      userId,
      dateRange,
    );

    // Resolve muscle metadata for all unique exercises
    const uniqueExerciseIds = [
      ...new Set(
        sessions.flatMap((s) => s.exerciseLogs.map((l) => l.exerciseId)),
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

    // Group sessions by date
    const sessionDateMap = new Map<string, Set<string>>(); // "date|muscle" → sessionIds
    for (const session of sessions) {
      if (!session.endedAt) continue;
      const dateKey = session.endedAt.toISOString().split("T")[0];

      // Collect muscle groups for this session (deduplicated)
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

      // Each muscle counted once per session on this date
      for (const muscle of muscleGroupsThisSession) {
        const key = `${dateKey}|${muscle}`;
        const existing = sessionDateMap.get(key);
        if (existing) {
          existing.add(session.id);
        } else {
          sessionDateMap.set(key, new Set([session.id]));
        }
      }
    }

    // Convert to flat data points
    const data = MUSCLE_GROUPS.flatMap((muscle) => {
      const points: HeatmapDataPoint[] = [];
      for (const [key, sessionIds] of sessionDateMap) {
        const [date] = key.split("|");
        if (key.endsWith(`|${muscle}`)) {
          points.push({ date, muscle, frequency: sessionIds.size });
        }
      }
      return points;
    }).sort((a, b) => a.date.localeCompare(b.date) || a.muscle.localeCompare(b.muscle));

    return { range: muscleFrequencyRange, data };
  }

  // ── Consistency — Workout Frequency (Feature 6.1) + Streak (6.2)

  async getConsistencyFrequency(
    userId: string,
    consistencyRange: ConsistencyRange = "weekly",
    options?: AnalyticsOptions,
  ): Promise<AnalyticsResponse<ConsistencyResponse>> {
    const cacheKey = `consistency-${consistencyRange}`;
    const data = await cached(userId, cacheKey, undefined, () =>
      this.computeConsistency(userId, consistencyRange, options),
    );
    return wrap(data, options, undefined);
  }

  private async computeConsistency(
    userId: string,
    consistencyRange: ConsistencyRange,
    options?: AnalyticsOptions,
  ): Promise<ConsistencyResponse> {
    const msPerDay = 86_400_000;
    const days = consistencyRange === "weekly" ? 7 * 12 : 365;
    const dateRange: AnalyticsDateRange = {
      startDate: options?.startDate ?? new Date(Date.now() - days * msPerDay),
      endDate: options?.endDate,
    };

    const sessions = await this.repository.getCompletedSessionDates(userId, dateRange);

    // ── Frequency aggregation ──
    const periodCounts = new Map<string, number>();
    for (const session of sessions) {
      if (!session.endedAt) continue;
      const periodKey =
        consistencyRange === "weekly"
          ? getWeekPeriod(session.endedAt)
          : getMonthPeriod(session.endedAt);
      periodCounts.set(periodKey, (periodCounts.get(periodKey) ?? 0) + 1);
    }

    const frequencyData = Array.from(periodCounts.entries())
      .map(([period, workouts]) => ({ period, workouts }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // ── Streak analysis ──
    const activeDates = new Set(
      sessions
        .filter((s) => s.endedAt)
        .map((s) => toDateKey(s.endedAt!)),
    );

    const streak = computeStreakAnalysis(activeDates, dateRange);

    // ── Duration analysis ──
    const durationSessions = await this.repository.getCompletedSessionDurations(userId, dateRange);
    const durations = durationSessions
      .map((s) => s.duration)
      .filter((d): d is number => d != null && d > 0);

    const duration = computeDurationAnalysis(durations);

    return {
      range: consistencyRange,
      frequency: { data: frequencyData },
      streak,
      duration,
    };
  }

  // ── Volume Comparison (Feature 4.1) ─────────────────────────────

  async getVolumeComparison(
    userId: string,
    exerciseId: string,
    workoutSessionId: string,
  ): Promise<AnalyticsResponse<VolumeComparisonResponse>> {
    // Verify the current session exists and is completed
    const currentSession = await this.repository.getWorkoutSessionById(
      workoutSessionId,
      userId,
    );
    if (!currentSession) {
      throw new ApiError(404, "Workout session not found or not completed");
    }

    // Fetch all completed exercise logs for this exercise (all time)
    const logs = await this.repository.getExerciseLogsForExercise(
      userId,
      exerciseId,
    );

    // Group by session
    const sessionMap = new Map<
      string,
      {
        endedAt: Date;
        volume: number;
        exerciseName: string;
      }
    >();

    for (const log of logs) {
      const sid = log.workoutSession.id;
      const logVolume = log.sets.reduce(
        (sum: number, set: { weight: unknown; reps: number }) =>
          sum + Number(set.weight) * set.reps,
        0,
      );

      const existing = sessionMap.get(sid);
      if (existing) {
        existing.volume += logVolume;
      } else {
        sessionMap.set(sid, {
          endedAt: log.workoutSession.endedAt!,
          volume: logVolume,
          exerciseName: log.exerciseName,
        });
      }
    }

    // Get exercise name from current session's logs
    const currentLogs = logs.filter(
      (l) => l.workoutSession.id === workoutSessionId,
    );
    const exerciseName = currentLogs[0]?.exerciseName ?? exerciseId;

    // Current workout volume
    const currentVolume = sessionMap.get(workoutSessionId)?.volume ?? 0;

    // Sort sessions by date to find previous and weekly
    const sortedSessions = Array.from(sessionMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => a.endedAt.getTime() - b.endedAt.getTime());

    // Find previous session (before current)
    const currentIndex = sortedSessions.findIndex(
      (s) => s.id === workoutSessionId,
    );
    const previousSession =
      currentIndex > 0 ? sortedSessions[currentIndex - 1] : null;

    // Calculate weekly average (week of current session, Mon-Sun)
    const currentEndedAt = currentSession.endedAt!;
    const weekStart = getWeekStart(currentEndedAt);
    const weekEnd = new Date(weekStart.getTime() + 7 * MS_PER_DAY);

    let weeklyTotal = 0;
    let weeklyCount = 0;
    for (const session of sortedSessions) {
      if (session.endedAt >= weekStart && session.endedAt < weekEnd) {
        weeklyTotal += session.volume;
        weeklyCount += 1;
      }
    }

    const result: VolumeComparisonResponse = {
      exerciseId,
      exerciseName,
      currentWorkout: {
        volume: Math.round(currentVolume),
        date: toDateKey(currentEndedAt),
        workoutSessionId,
      },
      previousWorkout: previousSession
        ? {
            volume: Math.round(previousSession.volume),
            date: toDateKey(previousSession.endedAt),
            workoutSessionId: previousSession.id,
          }
        : null,
      weeklyAverage:
        weeklyCount > 0 ? Math.round(weeklyTotal / weeklyCount) : 0,
    };

    return wrap(result, undefined, undefined);
  }

  // ── Aggregate analytics (single fetch) ────────────────────────────

  async getDashboardAnalytics(
    userId: string,
  ): Promise<
    AnalyticsResponse<{
      statistics: Statistics;
      volume: VolumeAnalytics;
      frequency: WorkoutFrequencyResponse;
    }>
  > {
    const [statistics, volume, frequency] = await Promise.all([
      this.getStatistics(userId),
      this.getVolumeAnalytics(userId, "30d"),
      this.getWorkoutFrequency(userId, "30d"),
    ]);

    return {
      data: {
        statistics: statistics.data,
        volume: volume.data,
        frequency: frequency.data,
      },
      meta: { range: "30d" },
    };
  }

  // ── Cache invalidation ────────────────────────────────────────────

  async invalidateUserCache(userId: string): Promise<void> {
    await invalidateUserAnalytics(userId);
  }
}

// ── Singleton (backward-compatible export) ─────────────────────────

export const analyticsService = new AnalyticsService();
