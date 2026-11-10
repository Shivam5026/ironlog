import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import type {
  MuscleFatigue,
  MuscleRecoveryFrequency,
  OvertrainingSession,
  RecoveryTrendsConfig,
  RecoveryTrendsRange,
  RecoveryTrendsResponse,
  WeeklyFatigueEntry,
} from "../types/recovery.types";

/**
 * Recovery Trends Calculator (Feature 7.1)
 *
 * Pure, side-effect-free aggregation rules for the recovery analytics. The
 * roadmap does not prescribe exact formulas, ranges, or event definitions, so
 * every rule here is explicit, documented, configurable, and deterministic:
 *
 * - Estimated recovery time: for each completed session in the range and each
 *   muscle it trained, the model's time-based recovery duration
 *   (recoveryHours[muscle]). A measurement is "unavailable" only when the
 *   configured duration is unusable (non-finite or non-positive); those are
 *   excluded from the average.
 * - Observed recovery time: hours between a completed session training muscle
 *   M and the next completed session (also in range) training M. Cycles
 *   without a later training are incomplete and excluded.
 * - Recovery frequency: a qualifying recovery event is a completed training of
 *   muscle M whose model-estimated recovery completes within the range
 *   (endedAt + recoveryHours[M] <= range end). This ties the count to a
 *   transition to fully recovered rather than to raw API requests.
 * - Weekly fatigue: per-muscle fatigue scores returned by the fatigue engine
 *   for each calendar week (Monday boundary by default), averaged across the
 *   trained muscles. Weeks without training report 0 rather than fabricating a
 *   score.
 *
 * Nothing here touches the database, Redis, or the network.
 */

const MS_PER_DAY = 86_400_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export const DEFAULT_TRENDS_CONFIG: RecoveryTrendsConfig = {
  rangeDays: { "7d": 7, "30d": 30, "90d": 90 },
  weekStartDay: 1, // Monday
  averageRounding: 1,
};

export const TRENDS_RANGES: readonly RecoveryTrendsRange[] = [
  "7d",
  "30d",
  "90d",
];

export function isTrendsRange(value: unknown): value is RecoveryTrendsRange {
  return TRENDS_RANGES.includes(value as RecoveryTrendsRange);
}

export function resolveTrendsConfig(
  config: Partial<RecoveryTrendsConfig> = {},
): RecoveryTrendsConfig {
  return {
    rangeDays: { ...DEFAULT_TRENDS_CONFIG.rangeDays, ...config.rangeDays },
    weekStartDay:
      config.weekStartDay ?? DEFAULT_TRENDS_CONFIG.weekStartDay,
    averageRounding:
      config.averageRounding ?? DEFAULT_TRENDS_CONFIG.averageRounding,
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// ── Week boundaries ────────────────────────────────────────────────

/** Start (00:00 UTC) of the week containing `date`, on the configured day. */
export function startOfWeek(date: Date, weekStartDay = 1): Date {
  const utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  const offset = (new Date(utc).getUTCDay() - weekStartDay + 7) % 7;
  return new Date(utc - offset * MS_PER_DAY);
}

/**
 * Every week start (inclusive) on/after the week containing `rangeStart`,
 * ending with the week containing `now`. Drives the weekly fatigue snapshots.
 */
export function buildWeekStarts(
  rangeStart: Date,
  now: Date,
  weekStartDay = 1,
): Date[] {
  const weeks: Date[] = [];
  let cursor = startOfWeek(rangeStart, weekStartDay);
  while (cursor.getTime() <= now.getTime()) {
    weeks.push(cursor);
    cursor = new Date(cursor.getTime() + MS_PER_WEEK);
  }
  return weeks;
}

// ── Estimated recovery time ────────────────────────────────────────

function isUsableRecoveryHours(hours: number): boolean {
  return Number.isFinite(hours) && hours > 0;
}

/**
 * Model-estimated recovery durations: `recoveryHours[muscle]` for every
 * (session, trained muscle) in range. Unavailable (unusable) configurations
 * are excluded so they never skew the average.
 */
export function collectEstimatedRecoveryHours(
  sessions: OvertrainingSession[],
  recoveryHours: Record<MuscleGroup, number>,
): number[] {
  const durations: number[] = [];
  for (const session of sessions) {
    for (const muscle of session.musclesTrained) {
      const duration = recoveryHours[muscle];
      if (isUsableRecoveryHours(duration)) durations.push(duration);
    }
  }
  return durations;
}

// ── Observed recovery time ─────────────────────────────────────────

/**
 * Hours between a completed session training muscle M and the next completed
 * session (within the provided set) also training M. A muscle is only "observed
 * recovered" once it is trained again, so the last training of M with no later
 * training is an incomplete measurement and is excluded.
 */
export function collectObservedRecoveryHours(
  sessions: OvertrainingSession[],
): number[] {
  const sorted = [...sessions].sort(
    (a, b) => a.endedAt.getTime() - b.endedAt.getTime(),
  );

  const byMuscle = new Map<MuscleGroup, Date[]>();
  for (const session of sorted) {
    for (const muscle of session.musclesTrained) {
      const times = byMuscle.get(muscle) ?? [];
      times.push(session.endedAt);
      byMuscle.set(muscle, times);
    }
  }

  const cycles: number[] = [];
  for (const times of byMuscle.values()) {
    for (let i = 0; i < times.length - 1; i++) {
      const current = times[i].getTime();
      const next = times[i + 1].getTime();
      if (next > current) cycles.push((next - current) / 3_600_000);
    }
  }
  return cycles;
}

// ── Recovery frequency ─────────────────────────────────────────────

/**
 * Qualifying recovery events per muscle: completed sessions training the
 * muscle whose model-estimated recovery (endedAt + recoveryHours[muscle])
 * completes on or before the range end. Muscles without a usable recovery
 * duration can never qualify, so their count stays 0.
 */
export function countRecoveryEvents(
  sessions: OvertrainingSession[],
  rangeEnd: Date,
  recoveryHours: Record<MuscleGroup, number>,
): Record<MuscleGroup, number> {
  const counts = Object.fromEntries(
    MUSCLE_GROUPS.map((muscle) => [muscle, 0]),
  ) as Record<MuscleGroup, number>;

  const rangeEndMs = rangeEnd.getTime();
  for (const session of sessions) {
    const endedAt = session.endedAt.getTime();
    for (const muscle of session.musclesTrained) {
      const duration = recoveryHours[muscle];
      if (isUsableRecoveryHours(duration)) {
        const recoveryComplete = endedAt + duration * 3_600_000;
        if (recoveryComplete <= rangeEndMs) counts[muscle] += 1;
      }
    }
  }

  return counts;
}

// ── Weekly fatigue ─────────────────────────────────────────────────

export interface WeeklyFatigueInput {
  weekStart: Date;
  /** Fatigue readings for the muscles trained that week (empty = none). */
  fatigues: MuscleFatigue[];
}

function aggregateWeeklyFatigue(
  weeks: WeeklyFatigueInput[],
  rounding: number,
): WeeklyFatigueEntry[] {
  return weeks.map((week) => {
    const byMuscle = new Map<string, number>();
    for (const fatigue of week.fatigues) {
      byMuscle.set(fatigue.muscle, fatigue.fatigueScore);
    }

    const muscleBreakdown = MUSCLE_GROUPS.filter((muscle) =>
      byMuscle.has(muscle),
    ).map((muscle) => ({
      muscle,
      fatigueScore: round(byMuscle.get(muscle)!, rounding),
    }));

    const averageFatigue =
      muscleBreakdown.length === 0
        ? 0
        : round(
            mean(muscleBreakdown.map((entry) => entry.fatigueScore)),
            rounding,
          );

    return {
      weekStart: week.weekStart.toISOString(),
      averageFatigue,
      muscleBreakdown,
    };
  });
}

// ── Entry point ────────────────────────────────────────────────────

export interface RecoveryTrendsAggregateInput {
  range: RecoveryTrendsRange;
  sessions: OvertrainingSession[];
  weeks: WeeklyFatigueInput[];
  /** Reference time the range, recovery windows, and generatedAt anchor to. */
  now: Date;
  recoveryHours: Record<MuscleGroup, number>;
  config?: Partial<RecoveryTrendsConfig>;
}

/** Shapes the fully deterministic recovery-trends response for a period. */
export function calculateRecoveryTrends(
  input: RecoveryTrendsAggregateInput,
): RecoveryTrendsResponse {
  const config = resolveTrendsConfig(input.config);

  const estimated = collectEstimatedRecoveryHours(
    input.sessions,
    input.recoveryHours,
  );
  const observed = collectObservedRecoveryHours(input.sessions);

  const frequencyRecord = countRecoveryEvents(
    input.sessions,
    input.now,
    input.recoveryHours,
  );
  const recoveryFrequency: MuscleRecoveryFrequency[] = MUSCLE_GROUPS.map(
    (muscle) => ({ muscle, count: frequencyRecord[muscle] }),
  );

  return {
    range: input.range,
    averageRecoveryHours:
      estimated.length === 0
        ? null
        : round(mean(estimated), config.averageRounding),
    observedRecoveryHours:
      observed.length === 0
        ? null
        : round(mean(observed), config.averageRounding),
    recoveryFrequency,
    weeklyFatigue: aggregateWeeklyFatigue(
      input.weeks,
      config.averageRounding,
    ),
    generatedAt: input.now.toISOString(),
  };
}