import type {
  DailyReadiness,
  ReadinessCalculatorConfig,
  ReadinessFactorInputs,
  ReadinessFactors,
  ReadinessLevel,
  ReadinessThresholds,
  ReadinessWeights,
} from "../types/recovery.types";

export type { ReadinessLevel } from "../types/recovery.types";

/**
 * Readiness Calculator (Feature 4.1)
 *
 * Pure, side-effect-free readiness math. The roadmap defines the four factors
 * but does not prescribe their weights or an exact scoring formula, so this is
 * a configurable weighted model instead of canonical coefficients:
 *
 *   S = wᵣR + w_f F + w_c C + w_d D,  with  wᵣ + w_f + w_c + w_d = 1
 *
 * Every factor is normalized to 0-100 (100 = fully ready) before combining:
 *   R  muscle recovery   — mean recovery of the muscles trained recently
 *   F  frequency         — fewer recent sessions → higher readiness
 *   C  streak            — shorter consecutive-training run → higher readiness
 *   D  duration trend    — recent sessions ~ baseline → higher readiness
 *
 * Durations are interpreted relative to the user's own baseline, never as an
 * absolute "long is bad"; only longer-than-usual work drags the score down.
 *
 * The numeric score is deliberately kept apart from any Low / Moderate / High
 * label — that mapping belongs to Feature 4.2.
 */

export const READINESS_WEIGHTS: ReadinessWeights = {
  muscleRecovery: 0.5,
  workoutFrequency: 0.2,
  consecutiveTrainingDays: 0.15,
  workoutDurationTrend: 0.15,
};

export const DEFAULT_READINESS_THRESHOLDS: ReadinessThresholds = {
  low: 40,
  moderate: 70,
};

export const DEFAULT_READINESS_CONFIG: ReadinessCalculatorConfig = {
  weights: { ...READINESS_WEIGHTS },
  // Recent period for frequency, streak recency, and recent durations.
  frequencyWindowDays: 7,
  // Four sessions in the window already saturate the frequency penalty.
  frequencyReference: 4,
  // Five consecutive training days saturate the streak penalty.
  streakReferenceDays: 5,
  // Long-term duration baseline over the trailing month.
  baselineWindowDays: 28,
  // A 50%-longer-than-usual recent average costs 25 points.
  durationSensitivity: 0.5,
  // Muscles trained in the last week feed the muscle-recovery factor.
  muscleRecoveryLookbackDays: 7,
  // Roadmap categories (LOW / MODERATE / HIGH) with initial defaults.
  readinessThresholds: DEFAULT_READINESS_THRESHOLDS,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * R: average recovery percentage of the muscles trained in the recent period.
 * A muscle group with no training record carries no recovery load, so it is
 * excluded rather than lowering the average.
 */
export function muscleRecoveryFactor(recoveryPercentages: number[]): number {
  const values = recoveryPercentages.filter((v) => Number.isFinite(v));
  if (values.length === 0) return 100; // nothing was trained → nothing to recover
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(clamp(mean, 0, 100));
}

/**
 * F: more completed sessions in the recent window than the reference imply
 * accumulated fatigue, so the factor drops toward 0.
 */
export function workoutFrequencyFactor(
  sessionCount: number,
  reference = DEFAULT_READINESS_CONFIG.frequencyReference,
): number {
  if (!Number.isFinite(sessionCount) || sessionCount <= 0) return 100;
  return Math.round(clamp(100 - (sessionCount * 100) / reference, 0, 100));
}

/**
 * C: uninterrupted consecutive training days accumulate fatigue, so longer
 * streaks score lower.
 */
export function consecutiveTrainingDaysFactor(
  streakDays: number,
  reference = DEFAULT_READINESS_CONFIG.streakReferenceDays,
): number {
  if (!Number.isFinite(streakDays) || streakDays <= 0) return 100;
  return Math.round(clamp(100 - (streakDays * 100) / reference, 0, 100));
}

/**
 * D: recent duration compared to the user's own baseline. Only a recent
 * average that is longer than usual reduces readiness; durations at or below
 * the baseline (or unknown) stay at 100, and the penalty is scaled by
 * `durationSensitivity`. Missing data never breaks the calculation.
 */
export function workoutDurationTrendFactor(
  recentAvgDurationSeconds: number | null,
  baselineAvgDurationSeconds: number | null,
  sensitivity = DEFAULT_READINESS_CONFIG.durationSensitivity,
): number {
  if (
    recentAvgDurationSeconds === null ||
    baselineAvgDurationSeconds === null ||
    baselineAvgDurationSeconds <= 0 ||
    recentAvgDurationSeconds <= 0
  ) {
    return 100;
  }

  const deviation =
    ((recentAvgDurationSeconds - baselineAvgDurationSeconds) /
      baselineAvgDurationSeconds) *
    100;
  const penalty = clamp(Math.max(0, deviation) * sensitivity, 0, 100);
  return Math.round(clamp(100 - penalty, 0, 100));
}

/** Calendar-day key in UTC so streaks are timezone independent. */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Counts how many consecutive calendar days the user has trained, finishing
 * at their most recent session day. A streak that ended outside the recent
 * window no longer represents accumulated fatigue, so it scores as 0.
 * Shared by the readiness and recommendation services.
 */
export function consecutiveTrainingDays(
  sessionDates: Date[],
  now: Date,
  frequencyWindowDays: number,
): number {
  if (sessionDates.length === 0) return 0;

  const days = new Set(sessionDates.map((date) => dayKey(date)));
  const lastSession = sessionDates.reduce((latest, date) =>
    date.getTime() > latest.getTime() ? date : latest,
  );

  if (
    lastSession.getTime() <
    now.getTime() - frequencyWindowDays * MS_PER_DAY
  ) {
    return 0;
  }

  let streak = 0;
  let cursor = new Date(`${dayKey(lastSession)}T00:00:00.000Z`);
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - MS_PER_DAY);
  }
  return streak;
}

const MS_PER_DAY = 86_400_000;

/**
 * Maps a readiness score onto the roadmap categories. Out-of-range or
 * non-finite scores are rejected rather than silently mislabeled. The
 * thresholds are configurable defaults, not canonical roadmap values.
 */
export function getReadinessLevel(
  score: number,
  thresholds: ReadinessThresholds = DEFAULT_READINESS_THRESHOLDS,
): ReadinessLevel {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("Readiness score must be between 0 and 100");
  }

  if (score < thresholds.low) return "LOW";
  if (score < thresholds.moderate) return "MODERATE";

  return "HIGH";
}

export class ReadinessCalculator {
  private readonly config: ReadinessCalculatorConfig;

  constructor(config: Partial<ReadinessCalculatorConfig> = {}) {
    this.config = {
      ...DEFAULT_READINESS_CONFIG,
      ...config,
      // Deep-merge so a partial weights override keeps the rest.
      weights: {
        ...DEFAULT_READINESS_CONFIG.weights,
        ...(config.weights ?? {}),
      },
      // Deep-merge so a partial thresholds override keeps the other boundary.
      readinessThresholds: {
        ...DEFAULT_READINESS_CONFIG.readinessThresholds,
        ...(config.readinessThresholds ?? {}),
      },
    };
  }

  getConfig(): ReadinessCalculatorConfig {
    return {
      ...this.config,
      weights: { ...this.config.weights },
      readinessThresholds: { ...this.config.readinessThresholds },
    };
  }

  /** Normalizes raw inputs to the four 0-100 readiness factors. */
  normalize(inputs: ReadinessFactorInputs): ReadinessFactors {
    return {
      muscleRecovery: muscleRecoveryFactor(inputs.recoveryPercentages),
      workoutFrequency: workoutFrequencyFactor(
        inputs.recentSessionCount,
        this.config.frequencyReference,
      ),
      consecutiveTrainingDays: consecutiveTrainingDaysFactor(
        inputs.consecutiveTrainingDays,
        this.config.streakReferenceDays,
      ),
      workoutDurationTrend: workoutDurationTrendFactor(
        inputs.recentAvgDurationSeconds,
        inputs.baselineAvgDurationSeconds,
        this.config.durationSensitivity,
      ),
    };
  }

  /**
   * Combines the normalized factors into the daily readiness score.
   * Weights are renormalized so any configuration still sums to 1.
   */
  calculate(
    inputs: ReadinessFactorInputs,
    now: Date = new Date(),
  ): DailyReadiness {
    const factors = this.normalize(inputs);
    const w = this.config.weights;
    const total =
      w.muscleRecovery +
      w.workoutFrequency +
      w.consecutiveTrainingDays +
      w.workoutDurationTrend;
    const weighted =
      w.muscleRecovery * factors.muscleRecovery +
      w.workoutFrequency * factors.workoutFrequency +
      w.consecutiveTrainingDays * factors.consecutiveTrainingDays +
      w.workoutDurationTrend * factors.workoutDurationTrend;
    const score = Math.round(clamp(weighted / (total || 1), 0, 100));

    return {
      score,
      level: getReadinessLevel(score, this.config.readinessThresholds),
      factors,
      calculatedAt: now.toISOString(),
    };
  }
}

export const readinessCalculator = new ReadinessCalculator();