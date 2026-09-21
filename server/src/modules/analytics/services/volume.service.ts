import { prisma } from "../../../config/prisma";
import type {
  AnalyticsRange,
  VolumeAnalyticsResponse,
  VolumeChartPoint,
} from "../types/analytics.types";

const MS_PER_DAY = 86_400_000;

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getRangeStartDate(range: AnalyticsRange): Date | null {
  if (range === "all") return null;

  const now = new Date();
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * MS_PER_DAY);
}

async function getVolumeAnalytics(
  userId: string,
  range: AnalyticsRange,
): Promise<VolumeAnalyticsResponse> {
  const startDate = getRangeStartDate(range);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      totalVolume: { not: null },
      ...(startDate ? { startedAt: { gte: startDate } } : {}),
    },
    select: {
      startedAt: true,
      totalVolume: true,
    },
    orderBy: { startedAt: "asc" },
  });

  // Group volume by calendar date
  const volumeByDate = new Map<string, number>();
  for (const session of sessions) {
    const key = toDateKey(session.startedAt);
    const vol = Number(session.totalVolume);
    volumeByDate.set(key, (volumeByDate.get(key) ?? 0) + vol);
  }

  // Convert to sorted array
  const data: VolumeChartPoint[] = Array.from(volumeByDate.entries())
    .map(([date, volume]) => ({ date, volume: Math.round(volume) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { range, data };
}

export const volumeService = {
  getVolumeAnalytics,
};
