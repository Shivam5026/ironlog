import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import type {
  OvertrainingAnalysis,
  OvertrainingConfig,
  OvertrainingInput,
  OvertrainingSession,
  TrainingRiskFlag,
  TrainingRiskLevel,
  TrainingRiskType,
} from "../types/recovery.types";
import { dayKey } from "./readiness.calculator";

/**
 * Overtraining Detection Calculator (Feature 5.3)
 *
 * Pure, deterministic engine that flags potential overtraining patterns in
 * recent training history:
 *   1. EXCESSIVE_VOLUME           — recent per-training-day volume (and sets)
 *                                  far above the user's own baseline.
 *   2. CONSECUTIVE_HEAVY_SESSIONS — repeated heavy sessions on consecutive
 *                                  days, with extra severity when back-to-back
 *                                  days hammer overlapping muscle groups.
 *   3. MUSCLE_WORKLOAD_IMBALANCE  — a muscle group taking a disproportionate
 *                                  share of recent workload vs other muscles
 *                                  and the user's recent pattern.
 *
 * The goal is to flag potential overtraining patterns, not to diagnose a
 * medical condition, and a single high-volume workout alone is never treated
 * as proof of overtraining. Thresholds are configurable; when the user lacks
 * enough history for a personalized baseline, documented fallback thresholds
 * are used instead of claiming a specific volume is universally excessive.
 */

export const DEFAULT_OVERTRAINING_CONFIG: OvertrainingConfig = {
  volumeWindowDays: 7,
  baselineWindowDays: 28,
  minBaselineSessions: 3,
  // Window volume-per-training-day at/above baseline x this flags the pattern.
  volumePerTrainingDayMultiplier: 1.4,
  // At/above this ratio the excessive-volume flag is HIGH rather than MODERATE.
  volumeHighRatio: 1.8,
  heavySessionVolumeMultiplier: 1.5,
  heavySessionSetMultiplier: 1.5,
  consecutiveHeavyDays: 3,
  muscleShareRatio: 2.5,
  minMuscleShareFloor: 0.1,
  highMuscleShare: 0.55,
  // Documented fallbacks for new users without personalized history.
  fallbackVolumePerTrainingDay: 40_000,
  fallbackHeavySessionVolume: 30_000,
  fallbackHeavySessionSets: 30,
  fallbackMaxMuscleShare: 0.4,
};

const MS_PER_DAY = 86_400_000;

const RISK_ORDER: Record<TrainingRiskLevel, number> = {
  LOW: 0,
  MODERATE: 1,
  HIGH: 2,
};

const FLAG_ORDER: Record<TrainingRiskType, number> = {
  EXCESSIVE_VOLUME: 0,
  CONSECUTIVE_HEAVY_SESSIONS: 1,
  MUSCLE_WORKLOAD_IMBALANCE: 2,
};

function round(value: number): number {
  return Math.round(value);
}

function maxRisk(flags: TrainingRiskFlag[]): TrainingRiskLevel {
  return flags.reduce<TrainingRiskLevel>(
    (highest, flag) =>
      RISK_ORDER[flag.level] > RISK_ORDER[highest] ? flag.level : highest,
    "LOW",
  );
}

function sortMuscles(muscles: MuscleGroup[]): MuscleGroup[] {
  return [...new Set(muscles)].sort(
    (a, b) => MUSCLE_GROUPS.indexOf(a) - MUSCLE_GROUPS.indexOf(b),
  );
}

interface SessionPartition {
  window: OvertrainingSession[];
  baseline: OvertrainingSession[];
  windowStartMs: number;
}

/** Splits sessions into the recent window and the baseline period before it. */
export function partitionSessions(
  sessions: OvertrainingSession[],
  now: Date,
  config: OvertrainingConfig,
): SessionPartition {
  const windowStartMs = now.getTime() - config.volumeWindowDays * MS_PER_DAY;
  const baselineStartMs =
    now.getTime() - (config.volumeWindowDays + config.baselineWindowDays) * MS_PER_DAY;

  const window: OvertrainingSession[] = [];
  const baseline: OvertrainingSession[] = [];

  for (const session of sessions) {
    if (!(session.endedAt instanceof Date) || Number.isNaN(session.endedAt.getTime())) {
      continue;
    }
    const ms = session.endedAt.getTime();
    if (ms >= windowStartMs) {
      window.push(session);
    } else if (ms >= baselineStartMs) {
      baseline.push(session);
    }
  }

  return { window, baseline, windowStartMs };
}

function distinctDays(sessions: OvertrainingSession[]): string[] {
  return Array.from(new Set(sessions.map((session) => dayKey(session.endedAt))));
}

function sumWorkload(
  sessions: OvertrainingSession[],
): Record<MuscleGroup, number> {
  const totals = Object.fromEntries(
    MUSCLE_GROUPS.map((muscle) => [muscle, 0]),
  ) as Record<MuscleGroup, number>;
  for (const session of sessions) {
    for (const muscle of MUSCLE_GROUPS) {
      totals[muscle] += session.muscleWorkload[muscle] ?? 0;
    }
  }
  return totals;
}

interface Baseline {
  sessionCount: number;
  meanSessionVolume: number;
  meanSessionSets: number;
  volumePerTrainingDay: number;
  muscleShare: Record<MuscleGroup, number>;
}

function buildBaseline(sessions: OvertrainingSession[]): Baseline {
  const count = sessions.length;
  const volumePerTrainingDay =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.volume, 0) / Math.max(distinctDays(sessions).length, 1)
      : 0;
  const workloadTotals = sumWorkload(sessions);
  const totalWorkload = MUSCLE_GROUPS.reduce((sum, m) => sum + workloadTotals[m], 0);
  const muscleShare = Object.fromEntries(
    MUSCLE_GROUPS.map((muscle) => [
      muscle,
      totalWorkload > 0 ? workloadTotals[muscle] / totalWorkload : 0,
    ]),
  ) as Record<MuscleGroup, number>;

  return {
    sessionCount: count,
    meanSessionVolume:
      count > 0 ? sessions.reduce((sum, s) => sum + s.volume, 0) / count : 0,
    meanSessionSets:
      count > 0 ? sessions.reduce((sum, s) => sum + s.sets, 0) / count : 0,
    volumePerTrainingDay,
    muscleShare,
  };
}

// ── Rule 1: excessive volume ───────────────────────────────────────

export interface ExcessiveVolumeResult {
  flag: TrainingRiskFlag | null;
  recommendation: string;
}

export function detectExcessiveVolume(
  window: OvertrainingSession[],
  baseline: Baseline,
  personalized: boolean,
  config: OvertrainingConfig,
): ExcessiveVolumeResult {
  const recommendation =
    "Cut total volume over the next few days to let recovery catch up.";

  const activeDays = distinctDays(window);
  const windowDays = activeDays.length;
  if (windowDays === 0) return { flag: null, recommendation };
  // A single high-volume workout alone is never treated as proof of overtraining.
  if (windowDays < 2) return { flag: null, recommendation };

  const totalVolume = window.reduce((sum, s) => sum + s.volume, 0);
  const totalSets = window.reduce((sum, s) => sum + s.sets, 0);
  const observedPerDay = totalVolume / windowDays;

  const thresholdPerDay = personalized
    ? baseline.volumePerTrainingDay * config.volumePerTrainingDayMultiplier
    : config.fallbackVolumePerTrainingDay;

  if (observedPerDay < thresholdPerDay) return { flag: null, recommendation };

  const ratio = observedPerDay / thresholdPerDay;
  const level = personalized
    ? ratio >= config.volumeHighRatio
      ? "HIGH"
      : "MODERATE"
    : ratio >= config.volumeHighRatio
      ? "HIGH"
      : "MODERATE";

  const observed = round(observedPerDay);
  const threshold = round(thresholdPerDay);
  const message = personalized
    ? `Recent training volume averages ${observed} kg·reps per training day ` +
      `(${totalVolume} total across ${windowDays} days, ${totalSets} sets), ` +
      `well above your typical ${round(baseline.volumePerTrainingDay)}. ` +
      `Consider trimming volume this week.`
    : `Recent training volume averages ${observed} kg·reps per training day ` +
      `(${totalVolume} total across ${windowDays} days, ${totalSets} sets), ` +
      `above the ${threshold} fallback ceiling for users without history.`;

  return {
    flag: {
      type: "EXCESSIVE_VOLUME",
      level,
      message,
      affectedMuscles: [],
      evidence: {
        observedValue: observed,
        threshold,
        unit: "kg·reps per training day",
      },
    },
    recommendation:
      level === "HIGH"
        ? "Take a rest day to offset an unusually heavy training week."
        : recommendation,
  };
}

// ── Rule 2: consecutive heavy sessions ──────────────────────────────

export interface ConsecutiveHeavyResult {
  flag: TrainingRiskFlag | null;
  recommendation: string;
}

export function detectConsecutiveHeavySessions(
  window: OvertrainingSession[],
  baseline: Baseline,
  personalized: boolean,
  config: OvertrainingConfig,
): ConsecutiveHeavyResult {
  const recommendation =
    "Take a lighter session or active recovery before training again.";

  const heavyVolumeThreshold = personalized
    ? baseline.meanSessionVolume * config.heavySessionVolumeMultiplier
    : config.fallbackHeavySessionVolume;
  const heavySetsThreshold = personalized
    ? baseline.meanSessionSets * config.heavySessionSetMultiplier
    : config.fallbackHeavySessionSets;

  const heavyByDay = new Map<string, Set<MuscleGroup>>();
  for (const session of window) {
    const heavy =
      session.volume >= heavyVolumeThreshold || session.sets >= heavySetsThreshold;
    if (!heavy) continue;
    const key = dayKey(session.endedAt);
    const muscles = heavyByDay.get(key) ?? new Set<MuscleGroup>();
    for (const muscle of session.musclesTrained) muscles.add(muscle);
    heavyByDay.set(key, muscles);
  }

  if (heavyByDay.size === 0) return { flag: null, recommendation };

  const days = Array.from(heavyByDay.keys()).sort();
  let longestRun = 1;
  let longestRunDays: string[] = [days[0]];
  let runStart = 0;
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(`${days[i - 1]}T00:00:00.000Z`).getTime();
    const curr = new Date(`${days[i]}T00:00:00.000Z`).getTime();
    if (curr - prev === MS_PER_DAY) {
      const runLength = i - runStart + 1;
      if (runLength > longestRun) {
        longestRun = runLength;
        longestRunDays = days.slice(runStart, i + 1);
      }
    } else {
      runStart = i;
    }
  }

  if (longestRun < config.consecutiveHeavyDays) {
    return { flag: null, recommendation };
  }

  // Muscles stressed on every day of the longest run → back-to-back overlap.
  let overlap: MuscleGroup[] = [];
  for (const muscle of MUSCLE_GROUPS) {
    const presentOnEveryDay = longestRunDays.every((key) =>
      heavyByDay.get(key)?.has(muscle),
    );
    if (presentOnEveryDay) overlap.push(muscle);
  }

  const level = overlap.length > 0 ? "HIGH" : "MODERATE";
  const affectedMuscles = overlap.length > 0 ? overlap : unionMuscles(heavyByDay);

  const message =
    `${longestRun} consecutive days of heavy sessions detected (threshold ` +
    `${config.consecutiveHeavyDays}); heavy means volume ≥ ` +
    `${round(heavyVolumeThreshold)} kg·reps or sets ≥ ${round(heavySetsThreshold)}.` +
    (overlap.length > 0
      ? ` ${overlap.join(", ")} are being trained back-to-back — give them a break.`
      : "");

  return {
    flag: {
      type: "CONSECUTIVE_HEAVY_SESSIONS",
      level,
      message,
      affectedMuscles: affectedMuscles.map(String),
      evidence: {
        observedValue: longestRun,
        threshold: config.consecutiveHeavyDays,
        unit: "days",
      },
    },
    recommendation:
      level === "HIGH"
        ? "Rest today — several heavy days in a row need a break."
        : recommendation,
  };
}

function unionMuscles(heavyByDay: Map<string, Set<MuscleGroup>>): MuscleGroup[] {
  const union = new Set<MuscleGroup>();
  for (const muscles of heavyByDay.values()) {
    for (const muscle of muscles) union.add(muscle);
  }
  return Array.from(union);
}

// ── Rule 3: disproportionate muscle workload ───────────────────────

export interface MuscleImbalanceResult {
  flag: TrainingRiskFlag | null;
  recommendation: string;
}

export function detectMuscleWorkloadImbalance(
  window: OvertrainingSession[],
  baseline: Baseline,
  personalized: boolean,
  config: OvertrainingConfig,
): MuscleImbalanceResult {
  const windowTotal = sumWorkload(window);
  const totalWorkload = MUSCLE_GROUPS.reduce((sum, m) => sum + windowTotal[m], 0);
  if (totalWorkload <= 0) {
    return { flag: null, recommendation: "" };
  }

  const share = Object.fromEntries(
    MUSCLE_GROUPS.map((muscle) => [muscle, windowTotal[muscle] / totalWorkload]),
  ) as Record<MuscleGroup, number>;

  const flags: Array<{ muscle: MuscleGroup; observed: number; threshold: number }> =
    [];

  if (personalized) {
    for (const muscle of MUSCLE_GROUPS) {
      const observed = share[muscle];
      const baselineShare = baseline.muscleShare[muscle];
      if (observed < config.minMuscleShareFloor) continue;
      if (observed < baselineShare * config.muscleShareRatio) continue;
      flags.push({
        muscle,
        observed,
        threshold: Math.max(
          baselineShare * config.muscleShareRatio,
          config.minMuscleShareFloor,
        ),
      });
    }
  } else {
    for (const muscle of MUSCLE_GROUPS) {
      const observed = share[muscle];
      if (observed <= config.fallbackMaxMuscleShare) continue;
      flags.push({ muscle, observed, threshold: config.fallbackMaxMuscleShare });
    }
  }

  if (flags.length === 0) {
    return { flag: null, recommendation: "" };
  }

  const worst = flags.reduce((a, b) => (b.observed > a.observed ? b : a));
  const high = flags.some((entry) => entry.observed >= config.highMuscleShare);
  const affectedMuscles = flags.map((entry) => entry.muscle);

  const observedPercent = round(worst.observed * 100);
  const thresholdPercent = round(worst.threshold * 100);
  const message = personalized
    ? `${worst.muscle} received ${observedPercent}% of recent training workload ` +
      `vs its typical ${round(baseline.muscleShare[worst.muscle] * 100)}% — ` +
      "a disproportionate share. Rebalance volume across muscle groups."
    : `${worst.muscle} took ${observedPercent}% of recent training workload — ` +
      "an unusually concentrated share for a new pattern. Rebalance across groups.";

  return {
    flag: {
      type: "MUSCLE_WORKLOAD_IMBALANCE",
      level: high ? "HIGH" : "MODERATE",
      message,
      affectedMuscles: affectedMuscles.map(String),
      evidence: {
        observedValue: observedPercent,
        threshold: thresholdPercent,
        unit: "percent",
      },
    },
    recommendation: `Give ${affectedMuscles.join(", ")} extra recovery and shift ` +
      "today's focus to less-stressed muscles.",
  };
}

// ── Calculator ─────────────────────────────────────────────────────

export class OvertrainingCalculator {
  private readonly config: OvertrainingConfig;

  constructor(config: Partial<OvertrainingConfig> = {}) {
    this.config = { ...DEFAULT_OVERTRAINING_CONFIG, ...config };
  }

  getConfig(): OvertrainingConfig {
    return { ...this.config };
  }

  calculate(input: OvertrainingInput, now: Date = new Date()): OvertrainingAnalysis {
    const { window, baseline } = partitionSessions(input.sessions, now, this.config);
    const baselineStats = buildBaseline(baseline);
    const personalized = baseline.length >= this.config.minBaselineSessions;
    const config = this.config;

    const volume = detectExcessiveVolume(window, baselineStats, personalized, config);
    const heavy = detectConsecutiveHeavySessions(window, baselineStats, personalized, config);
    const imbalance = detectMuscleWorkloadImbalance(window, baselineStats, personalized, config);

    const results: Array<{ type: TrainingRiskType; result: { flag: TrainingRiskFlag | null; recommendation: string } }> = [
      { type: "EXCESSIVE_VOLUME", result: volume },
      { type: "CONSECUTIVE_HEAVY_SESSIONS", result: heavy },
      { type: "MUSCLE_WORKLOAD_IMBALANCE", result: imbalance },
    ];

    const flagged = results.filter((entry) => entry.result.flag !== null);

    const flags = flagged
      .map((entry) => entry.result.flag as TrainingRiskFlag)
      // Deterministic flag order (volume, heavy, imbalance).
      .sort((a, b) => FLAG_ORDER[a.type] - FLAG_ORDER[b.type]);

    // Deterministic recommendation order with a dedupe guard.
    const recommendations = flagged
      .sort((a, b) => FLAG_ORDER[a.type] - FLAG_ORDER[b.type])
      .map((entry) => entry.result.recommendation)
      .filter((value, index, self) => self.indexOf(value) === index);

    return {
      riskLevel: maxRisk(flags),
      flags,
      recommendations,
      analyzedAt: now.toISOString(),
    };
  }
}

export const overtrainingCalculator = new OvertrainingCalculator();