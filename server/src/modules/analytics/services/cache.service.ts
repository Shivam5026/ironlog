/**
 * Analytics Cache Service
 *
 * Centralized Redis caching for analytics dashboard, weekly reports,
 * and monthly reports. User-scoped keys prevent cross-user leakage.
 */

import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../../../lib/cache";

// ── Key Prefixes ───────────────────────────────────────────────────

const KEYS = {
  DASHBOARD: "analytics:dashboard",
  WEEKLY_REPORT: "analytics:report:weekly",
  MONTHLY_REPORT: "analytics:report:monthly",
} as const;

// ── TTL (seconds) ──────────────────────────────────────────────────

const TTL = {
  DASHBOARD: 5 * 60,       // 5 minutes
  WEEKLY_REPORT: 15 * 60,  // 15 minutes
  MONTHLY_REPORT: 30 * 60, // 30 minutes
} as const;

// ── Key Builders ───────────────────────────────────────────────────

function dashboardKey(userId: string): string {
  return `${KEYS.DASHBOARD}:${userId}`;
}

function weeklyReportKey(userId: string, period: string): string {
  return `${KEYS.WEEKLY_REPORT}:${userId}:${period}`;
}

function monthlyReportKey(userId: string, period: string): string {
  return `${KEYS.MONTHLY_REPORT}:${userId}:${period}`;
}

// ── Dashboard Cache ────────────────────────────────────────────────

export async function getDashboardCache<T>(
  userId: string,
): Promise<T | null> {
  return getCache<T>(dashboardKey(userId));
}

export async function setDashboardCache<T>(
  userId: string,
  data: T,
): Promise<void> {
  await setCache(dashboardKey(userId), data, TTL.DASHBOARD);
}

// ── Weekly Report Cache ────────────────────────────────────────────

export async function getWeeklyReportCache<T>(
  userId: string,
  period: string,
): Promise<T | null> {
  return getCache<T>(weeklyReportKey(userId, period));
}

export async function setWeeklyReportCache<T>(
  userId: string,
  period: string,
  data: T,
): Promise<void> {
  await setCache(weeklyReportKey(userId, period), data, TTL.WEEKLY_REPORT);
}

// ── Monthly Report Cache ───────────────────────────────────────────

export async function getMonthlyReportCache<T>(
  userId: string,
  period: string,
): Promise<T | null> {
  return getCache<T>(monthlyReportKey(userId, period));
}

export async function setMonthlyReportCache<T>(
  userId: string,
  period: string,
  data: T,
): Promise<void> {
  await setCache(monthlyReportKey(userId, period), data, TTL.MONTHLY_REPORT);
}

// ── Invalidation ───────────────────────────────────────────────────

export async function invalidateUserAnalytics(
  userId: string,
): Promise<void> {
  await Promise.all([
    deleteCache(dashboardKey(userId)),
    deleteCacheByPattern(`${KEYS.WEEKLY_REPORT}:${userId}:*`),
    deleteCacheByPattern(`${KEYS.MONTHLY_REPORT}:${userId}:*`),
  ]);
}
