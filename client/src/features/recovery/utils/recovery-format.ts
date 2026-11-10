import type {
  FatigueLevel,
  MuscleRecovery,
  OverallFatigue,
  ReadinessLevel,
  RecoveryStatus,
  WorkoutRecommendationType,
} from "../types/recovery.types";

/**
 * Presentation metadata for recovery statuses, readiness levels, fatigue
 * levels, and recommendation types. Colors are never the only signal — every
 * indicator is paired with a text label for accessibility.
 */

// ── Per-muscle recovery statuses ───────────────────────────────────

export const recoveryStatusMeta: Record<
  RecoveryStatus,
  { label: string; dot: string; text: string }
> = {
  FULLY_RECOVERED: {
    label: "Fully Recovered",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  NEARLY_READY: {
    label: "Nearly Ready",
    dot: "bg-green-400",
    text: "text-green-600 dark:text-green-400",
  },
  RECOVERING: {
    label: "Still Recovering",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  NOT_READY: {
    label: "Not Ready",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
  },
};

export function recoveryPercentageTone(percentage: number): string {
  if (percentage < 40) return "bg-rose-500";
  if (percentage < 70) return "bg-amber-500";
  return "bg-emerald-500";
}

// ── Readiness levels ───────────────────────────────────────────────

export const readinessLevelMeta: Record<
  ReadinessLevel,
  { label: string; bar: string; badge: string; description: string }
> = {
  HIGH: {
    label: "High readiness",
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    description: "You're primed — push hard today.",
  },
  MODERATE: {
    label: "Moderate readiness",
    bar: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    description: "Train, but keep recovery in mind.",
  },
  LOW: {
    label: "Low readiness",
    bar: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    description: "Prioritize rest over intensity.",
  },
};

// ── Overall fatigue levels ─────────────────────────────────────────

export const fatigueLevelMeta: Record<
  FatigueLevel,
  { label: string; dot: string; badge: string; description: string }
> = {
  LOW: {
    label: "Low",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    description: "Muscles are largely recovered.",
  },
  MODERATE: {
    label: "Moderate",
    dot: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    description: "Some muscles need attention.",
  },
  HIGH: {
    label: "High",
    dot: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    description: "Significant accumulated fatigue — recover first.",
  },
};

// ── Recommendation types ───────────────────────────────────────────

export const recommendationTypeMeta: Record<
  WorkoutRecommendationType,
  { label: string; badge: string }
> = {
  TRAIN_PUSH: { label: "Train · Push", badge: "bg-primary" },
  TRAIN_PULL: { label: "Train · Pull", badge: "bg-primary" },
  TRAIN_LEGS: { label: "Train · Legs", badge: "bg-primary" },
  ACTIVE_RECOVERY: { label: "Active Recovery", badge: "bg-amber-500" },
  REST_DAY: { label: "Rest Day", badge: "bg-rose-500" },
};

// ── Derived overall fatigue ────────────────────────────────────────

/** Average of the trained muscles' fatigue scores. */
export function deriveOverallFatigue(
  muscles: MuscleRecovery[],
): OverallFatigue {
  const trained = muscles.filter((muscle) => muscle.fatigueScore > 0);
  const trainedCount = trained.length;
  const average =
    trainedCount > 0
      ? trained.reduce((sum, muscle) => sum + muscle.fatigueScore, 0) /
        trainedCount
      : 0;

  const level: FatigueLevel =
    average >= 66 ? "HIGH" : average >= 33 ? "MODERATE" : "LOW";

  return { level, average: Math.round(average), trainedCount };
}

/** Trained muscles ordered by recovery percentage, least recovered first. */
export function sortMusclesByRecovery(
  muscles: MuscleRecovery[],
): MuscleRecovery[] {
  return [...muscles].sort(
    (a, b) => a.recoveryPercentage - b.recoveryPercentage,
  );
}

// ── Timeline estimate formatting (Feature 6.3) ─────────────────────

/** Human "time to full recovery" label, e.g. "25 hours" / "1 hour". */
export function formatHoursRemaining(hours: number): string {
  if (hours <= 0) return "0 hours";
  if (hours === 1) return "1 hour";
  return `${hours} hours`;
}

/**
 * Local date + time for an estimated full-recovery instant, e.g.
 * "Mon, Oct 12, 6:30 PM". Returns an empty string for an unparseable value
 * rather than inventing a date.
 */
export function formatRecoveryDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Recovery trends formatting (Feature 7.1) ───────────────────────

/**
 * Compact recovery-duration label from hours, e.g. "3d 6h", "25h", "45m".
 * Returns an em dash for a missing (null/non-finite) measurement rather than
 * inventing a value.
 */
export function formatRecoveryDuration(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours)) return "—";
  if (hours <= 0) return "0h";

  const totalMinutes = Math.round(hours * 60);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hoursWithinDay = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hoursWithinDay}h`;
  if (hoursWithinDay > 0) {
    return minutes > 0 ? `${hoursWithinDay}h ${minutes}m` : `${hoursWithinDay}h`;
  }
  return `${minutes}m`;
}

/** Short local week label from a week-start ISO date, e.g. "Mar 2". */
export function formatWeekStart(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Plain-language range label, e.g. "7 days" / "30 days" / "90 days". */
export function formatTrendsRange(range: string): string {
  const days = range.replace(/d$/, "");
  return `${days} days`;
}

/**
 * Compact number for chart axes/tooltips, e.g. 1_250 → "1.3k", 2_000_000 →
 * "2M". Non-finite values render as "0".
 */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}