import { prisma } from "../../../config/prisma";
import type { StreakData } from "../types/streak.types";

const MS_PER_DAY = 86_400_000;

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(a: Date, b: Date): number {
  const aMid = toDateOnly(a).getTime();
  const bMid = toDateOnly(b).getTime();
  return Math.round((aMid - bMid) / MS_PER_DAY);
}

function computeStreaks(sortedDates: Date[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longestStreak = 1;
  let currentStreak = 1;
  let streak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = daysBetween(sortedDates[i - 1], sortedDates[i]);
    if (diff === 1) {
      streak++;
    } else {
      // First gap breaks the current streak
      if (currentStreak === 1) {
        currentStreak = streak;
      }
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, streak);

  // Current streak: starts from most recent active date.
  // If no gap was found, currentStreak is still 1 — use streak.
  if (currentStreak === 1) {
    currentStreak = streak;
  }

  // If the most recent date is older than yesterday, the streak is broken.
  const today = toDateOnly(new Date());
  const mostRecent = sortedDates[0];
  const daysSinceMostRecent = daysBetween(today, mostRecent);

  if (daysSinceMostRecent > 1) {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak };
}

async function getStreak(userId: string): Promise<StreakData> {
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    select: {
      startedAt: true,
    },
  });

  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };
  }

  // Extract unique calendar dates using timezone-safe YYYY-MM-DD key
  const dateMap = new Map<string, Date>();
  for (const session of sessions) {
    const d = toDateOnly(session.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!dateMap.has(key)) {
      dateMap.set(key, d);
    }
  }

  // Sort newest → oldest
  const uniqueDates = Array.from(dateMap.values()).sort(
    (a, b) => b.getTime() - a.getTime(),
  );

  const { currentStreak, longestStreak } = computeStreaks(uniqueDates);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
  };
}

export const streakService = {
  getStreak,
};
