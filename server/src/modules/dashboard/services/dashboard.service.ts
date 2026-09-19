import { prisma } from "../../../config/prisma";
import { withCache, deleteCache } from "../../../lib/cache";
import { STATS_STATUSES } from "../../../utils/workoutStats";
import type {
  DashboardCurrentWeight,
  DashboardLastWorkout,
  DashboardResponse,
  DashboardStreak,
  DashboardTodayWorkout,
  DashboardWeeklyProgress,
} from "../types/dashboard.types";

const DAY_MS = 86_400_000;

/** Weekly goal: sessions per week the user is expected to complete. */
const DEFAULT_WEEKLY_TARGET = 3;

/** How long a user's dashboard snapshot stays fresh in Redis. */
const DASHBOARD_CACHE_TTL = 300;

export function dashboardCacheKey(userId: string): string {
  return `dashboard:${userId}`;
}

export function invalidateDashboard(userId: string): Promise<void> {
  return deleteCache(dashboardCacheKey(userId));
}

function startOfWeek(now = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function normalizeDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function getTodayWorkout(userId: string): Promise<DashboardTodayWorkout | null> {
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      workoutDays: {
        orderBy: { order: "asc" },
        take: 1,
        select: { id: true, name: true, _count: { select: { exercises: true } } },
      },
    },
  });

  const day = plan?.workoutDays[0];
  if (!plan || !day) return null;

  return {
    planId: plan.id,
    planName: plan.name,
    dayId: day.id,
    dayName: day.name,
    exerciseCount: day._count.exercises,
  };
}

/**
 * Current streak: consecutive days ending today (or yesterday when today is
 * still in progress) with at least one COMPLETED session.
 * Longest streak: longest run of consecutive active days.
 */
async function getStreakStats(userId: string): Promise<DashboardStreak> {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: { in: [...STATS_STATUSES] } },
    select: { startedAt: true },
    orderBy: { startedAt: "desc" },
    take: 2000,
  });

  const days = new Set<string>();
  for (const session of sessions) {
    days.add(dayKey(normalizeDay(new Date(session.startedAt))));
  }

  let current = 0;
  const cursor = normalizeDay(new Date());
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const stamps = [...days]
    .map((key) => key.split("-").map(Number))
    .map(([y, m, d]) => new Date(y, m - 1, d).getTime())
    .sort((a, b) => a - b);

  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const t of stamps) {
    run = prev !== null && t - prev === DAY_MS ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = t;
  }

  return { current, longest };
}

async function getWeeklyProgress(userId: string): Promise<DashboardWeeklyProgress> {
  const completedWorkouts = await prisma.workoutSession.count({
    where: {
      userId,
      status: { in: [...STATS_STATUSES] },
      endedAt: { gte: startOfWeek() },
    },
  });

  return { completedWorkouts, targetWorkouts: DEFAULT_WEEKLY_TARGET };
}

async function getCurrentBodyWeight(userId: string): Promise<DashboardCurrentWeight | null> {
  const entry = await prisma.bodyWeight.findFirst({
    where: { userId },
    orderBy: { recordedAt: "desc" },
    select: { weight: true, recordedAt: true },
  });

  if (!entry) return null;

  return {
    weight: Number(entry.weight),
    recordedAt: entry.recordedAt.toISOString(),
  };
}

async function getTotalVolume(userId: string): Promise<number> {
  const result = await prisma.workoutSession.aggregate({
    where: { userId, status: { in: [...STATS_STATUSES] } },
    _sum: { totalVolume: true },
  });

  return result._sum.totalVolume ? Number(result._sum.totalVolume) : 0;
}

async function getLastWorkout(userId: string): Promise<DashboardLastWorkout | null> {
  const session = await prisma.workoutSession.findFirst({
    where: { userId, status: { in: [...STATS_STATUSES] } },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      startedAt: true,
      endedAt: true,
      duration: true,
      totalVolume: true,
      workoutPlan: { select: { name: true } },
      workoutDay: { select: { name: true } },
    },
  });

  if (!session) return null;

  return {
    id: session.id,
    planName: session.workoutPlan.name,
    dayName: session.workoutDay.name,
    completedAt: (session.endedAt ?? session.startedAt).toISOString(),
    duration: session.duration,
    totalVolume: session.totalVolume ? Number(session.totalVolume) : 0,
  };
}

async function getDashboard(userId: string): Promise<DashboardResponse> {
  return withCache(
    dashboardCacheKey(userId),
    async () => {
      const [todayWorkout, streak, weeklyProgress, totalWorkouts, currentBodyWeight, totalVolume, lastWorkout] =
        await Promise.all([
          getTodayWorkout(userId),
          getStreakStats(userId),
          getWeeklyProgress(userId),
          prisma.workoutSession.count({
            where: { userId, status: { in: [...STATS_STATUSES] } },
          }),
          getCurrentBodyWeight(userId),
          getTotalVolume(userId),
          getLastWorkout(userId),
        ]);

      return {
        todayWorkout,
        streak,
        weeklyProgress,
        totalWorkouts,
        currentBodyWeight,
        totalVolume,
        lastWorkout,
      };
    },
    DASHBOARD_CACHE_TTL,
  );
}

async function getDashboardStats(userId: string) {
  const [plans, templates, days, exercises, weeklyWorkouts, streak] =
    await Promise.all([
      prisma.workoutPlan.count({ where: { userId } }),
      prisma.workoutTemplate.count({ where: { userId } }),
      prisma.workoutDay.count({ where: { workoutPlan: { userId } } }),
      prisma.workoutPlanExercise.count({
        where: { workoutDay: { workoutPlan: { userId } } },
      }),
      prisma.workoutSession.count({
        where: {
          userId,
          status: { in: [...STATS_STATUSES] },
          startedAt: { gte: startOfWeek() },
        },
      }),
      getStreakStats(userId).then((s) => s.current),
    ]);

  return {
    plans,
    templates,
    days,
    exercises,
    weeklyWorkouts,
    streak,
  };
}

async function getRecentPlans(userId: string) {
  return prisma.workoutPlan.findMany({
    where: { userId },
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
}

async function getRecentTemplates(userId: string) {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
}

export const dashboardService = {
  getDashboard,
  getDashboardStats,
  getRecentPlans,
  getRecentTemplates,
};