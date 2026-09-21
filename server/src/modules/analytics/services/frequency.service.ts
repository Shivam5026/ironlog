import { prisma } from "../../../config/prisma";
import type { AnalyticsRange, WorkoutFrequencyPoint, WorkoutFrequencyResponse } from "../types/analytics.types";

const MS_PER_DAY = 86_400_000;

function getRangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * MS_PER_DAY);
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function groupByWeek(sessions: { endedAt: Date }[]): WorkoutFrequencyPoint[] {
  const counts = new Map<string, { label: string; count: number; sortKey: string }>();

  for (const session of sessions) {
    const weekStart = getWeekKey(session.endedAt);
    const existing = counts.get(weekStart);
    if (existing) {
      existing.count++;
    } else {
      const d = new Date(weekStart);
      counts.set(weekStart, {
        label: formatWeekLabel(d),
        count: 1,
        sortKey: weekStart,
      });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, count }) => ({ period: label, workouts: count }));
}

function groupByMonth(sessions: { endedAt: Date }[]): WorkoutFrequencyPoint[] {
  const counts = new Map<string, { label: string; count: number; sortKey: string }>();

  for (const session of sessions) {
    const d = session.endedAt;
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = counts.get(monthKey);
    if (existing) {
      existing.count++;
    } else {
      counts.set(monthKey, {
        label: formatMonthLabel(d),
        count: 1,
        sortKey: monthKey,
      });
    }
  }

  return Array.from(counts.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, count }) => ({ period: label, workouts: count }));
}

async function getWorkoutFrequency(
  userId: string,
  range: AnalyticsRange,
): Promise<WorkoutFrequencyResponse> {
  const startDate = getRangeStartDate(range);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      endedAt: { not: null },
      ...(startDate ? { endedAt: { gte: startDate } } : {}),
    },
    select: { endedAt: true },
    orderBy: { endedAt: "asc" },
  });

  const completed = sessions.filter(
    (s): s is { endedAt: Date } => s.endedAt !== null,
  );

  if (completed.length === 0) {
    return { range, data: [] };
  }

  const useWeekly = range !== "all";
  const data = useWeekly
    ? groupByWeek(completed)
    : groupByMonth(completed);

  return { range, data };
}

export const frequencyService = {
  getWorkoutFrequency,
};
