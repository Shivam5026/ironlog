import {
  MUSCLE_GROUPS,
  type MuscleGroup,
} from "../../analytics/lib/muscleClassification";
import type {
  MuscleFatigue,
  RecoveryCalculatorConfig,
  RecoveryStatus,
  RecoverySummary,
  RecoveryTimelineItem,
} from "../types/recovery.types";

/**
 * Recovery Calculator (Feature 1.1 contract, rebuilt by Feature 3.2)
 *
 * Pure, side-effect-free recovery math. Isolated from the service layer and
 * from the database so the model stays configurable and can be swapped
 * without touching orchestration or transport code.
 *
 * Feature 3.1 replaced the original time-decay placeholder: a muscle's
 * recovery percentage is derived from its Epic 2 fatigue score via an
 * explicit, configurable formula. The roadmap defines the status thresholds
 * exactly but does not prescribe the fatigue → recovery formula.
 *
 * Feature 3.2 adds the time dimension: recovery climbs linearly from the
 * percentage the muscle had immediately after its latest workout toward 100%
 * over a per-muscle recovery duration. To avoid counting time twice, the
 * baseline (R₀) uses the fatigue the muscle had at the moment of training
 * (`fatigueAtTraining`), not the current, already-decayed fatigue score.
 * The explicit time curve therefore replaces the fatigue model's recency
 * decay as the source of recovery over time.
 */

/**
 * Configurable per-group recovery durations (hours to reach 100%).
 * Initial tuning defaults — not scientifically precise or roadmap-mandated,
 * and always overridable through RecoveryCalculatorConfig.recoveryHours.
 */
export const RECOVERY_HOURS: Record<MuscleGroup, number> = {
  Chest: 72,
  Back: 72,
  Legs: 72,
  Shoulders: 48,
  Biceps: 48,
  Triceps: 48,
  Forearms: 36,
  Core: 36,
  Glutes: 72,
  Hamstrings: 72,
  Calves: 48,
};

export const DEFAULT_RECOVERY_CONFIG: RecoveryCalculatorConfig = {
  // Default relationship: fatigue 0 → 100% recovered, fatigue 100 → 0%.
  // This is the intuitive inverse but is defined as config, not assumed.
  fatigueAtZeroRecovery: 100,
  fatigueAtFullRecovery: 0,
  recoveryHours: { ...RECOVERY_HOURS },
};

const MS_PER_HOUR = 3_600_000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a recovery percentage onto the roadmap's status scale:
 *   0-39 NOT_READY | 40-69 RECOVERING | 70-89 NEARLY_READY | 90-100 FULLY_RECOVERED
 */
export function classifyRecoveryStatus(percentage: number): RecoveryStatus {
  if (percentage < 40) return "NOT_READY";
  if (percentage < 70) return "RECOVERING";
  if (percentage < 90) return "NEARLY_READY";
  return "FULLY_RECOVERED";
}

/**
 * Converts a single muscle's fatigue score into a recovery percentage (0-100).
 *
 * Linear interpolation between the two configurable anchor points:
 *   fatigueAtZeroRecovery → 0% recovered
 *   fatigueAtFullRecovery → 100% recovered
 *
 * Invalid scores are treated as no fatigue, and out-of-range input is clamped.
 */
export function calculateRecoveryFromFatigue(
  fatigueScore: number,
  config: RecoveryCalculatorConfig = DEFAULT_RECOVERY_CONFIG,
): number {
  const score = Number(fatigueScore);
  if (!Number.isFinite(score)) return 100;

  const span = config.fatigueAtZeroRecovery - config.fatigueAtFullRecovery;
  if (span <= 0) return 100; // degenerate configuration → fully recovered

  const ratio =
    (config.fatigueAtZeroRecovery - score) /
    (config.fatigueAtZeroRecovery - config.fatigueAtFullRecovery);
  return Math.round(clamp(ratio, 0, 1) * 100);
}

/** Inputs to the time-based recovery progression (Feature 3.2). */
export interface TimeBasedRecoveryInput {
  /** Recovery percentage immediately after the latest workout (0-100). */
  initialRecoveryPercentage: number;
  /** Elapsed hours since the latest workout. */
  elapsedHours: number;
  /** Hours the muscle group needs to reach 100% recovery. */
  recoveryDurationHours: number;
}

/**
 * Linear recovery from the post-workout baseline toward 100% over the
 * muscle's recovery duration:
 *
 *   R(t) = min(100, R₀ + ((100 - R₀) / T) · t)
 *
 * Invalid or non-positive durations are treated as "already recovered".
 * Out-of-range inputs are clamped; elapsed time can never be negative.
 */
export function calculateTimeBasedRecovery({
  initialRecoveryPercentage,
  elapsedHours,
  recoveryDurationHours,
}: TimeBasedRecoveryInput): number {
  const initial = clamp(
    Number.isFinite(initialRecoveryPercentage)
      ? initialRecoveryPercentage
      : 100,
    0,
    100,
  );

  if (
    !Number.isFinite(recoveryDurationHours) ||
    recoveryDurationHours <= 0
  ) {
    return 100;
  }

  const elapsed = Number.isFinite(elapsedHours)
    ? Math.max(0, elapsedHours)
    : 0;

  return Math.round(
    clamp(
      initial + ((100 - initial) * elapsed) / recoveryDurationHours,
      0,
      100,
    ),
  );
}

/**
 * Full-recovery estimate for a timeline entry (Feature 6.3).
 *
 * The linear recovery curve reaches 100% exactly
 * `recoveryDurationHours - elapsedHours` hours after the estimate, i.e. at
 * `lastTrainedAt + recoveryDurationHours`. When the current recovery
 * percentage is already 100% the remaining time is zero. Estimates are never
 * invented: an unusable recovery duration yields no timestamp and no estimate
 * (both null).
 */
export interface FullRecoveryEstimate {
  estimatedFullRecoveryAt: string | null;
  estimatedHoursRemaining: number | null;
}

export function estimateFullRecovery({
  elapsedHours,
  recoveryDurationHours,
  recoveryPercentage,
  lastTrainedAt,
}: {
  elapsedHours: number;
  recoveryDurationHours: number;
  recoveryPercentage: number;
  lastTrainedAt: Date;
}): FullRecoveryEstimate {
  if (
    !Number.isFinite(recoveryDurationHours) ||
    recoveryDurationHours <= 0
  ) {
    // No reliable duration → no reliable estimate.
    return { estimatedFullRecoveryAt: null, estimatedHoursRemaining: null };
  }

  const completionAt = new Date(
    lastTrainedAt.getTime() + recoveryDurationHours * MS_PER_HOUR,
  );
  const iso = completionAt.toISOString();

  if (recoveryPercentage >= 100) {
    return { estimatedFullRecoveryAt: iso, estimatedHoursRemaining: 0 };
  }

  const roughRemaining = recoveryDurationHours - elapsedHours;
  return {
    estimatedFullRecoveryAt: iso,
    estimatedHoursRemaining: roughRemaining > 0 ? Math.ceil(roughRemaining) : 0,
  };
}

export class RecoveryCalculator {
  private readonly config: RecoveryCalculatorConfig;

  constructor(config: Partial<RecoveryCalculatorConfig> = {}) {
    this.config = {
      ...DEFAULT_RECOVERY_CONFIG,
      ...config,
      // Deep-merge so a partial recoveryHours override keeps the rest.
      recoveryHours: {
        ...DEFAULT_RECOVERY_CONFIG.recoveryHours,
        ...(config.recoveryHours ?? {}),
      },
    };
  }

  getConfig(): RecoveryCalculatorConfig {
    return {
      ...this.config,
      recoveryHours: { ...this.config.recoveryHours },
    };
  }

  /**
   * Builds the standardized per-muscle recovery entry for a muscle group.
   * `fatigue` is the Epic 2 result, or null when the muscle was not recently
   * trained (untrained muscles have no fatigue → fully recovered).
   */
  calculateMuscleRecovery(
    muscle: typeof MUSCLE_GROUPS[number],
    fatigue: MuscleFatigue | null,
    now: Date = new Date(),
  ) {
    if (!fatigue || fatigue.lastTrainedAt === null) {
      return {
        muscle,
        fatigueScore: 0,
        recoveryPercentage: 100,
        status: classifyRecoveryStatus(100),
        lastTrainedAt: null,
      };
    }

    // R₀ = recovery immediately after the latest workout, derived from the
    // fatigue the muscle had at that moment (recency undisturbed by decay).
    // Fall back to the current score for callers that pre-date Feature 3.2.
    const baseline = calculateRecoveryFromFatigue(
      fatigue.fatigueAtTraining ?? fatigue.fatigueScore,
      this.config,
    );

    const elapsedHours = Math.max(
      0,
      (now.getTime() - fatigue.lastTrainedAt.getTime()) / MS_PER_HOUR,
    );

    const recoveryPercentage = calculateTimeBasedRecovery({
      initialRecoveryPercentage: baseline,
      elapsedHours,
      recoveryDurationHours: this.config.recoveryHours[muscle],
    });

    return {
      muscle,
      fatigueScore: fatigue.fatigueScore,
      recoveryPercentage,
      status: classifyRecoveryStatus(recoveryPercentage),
      lastTrainedAt: fatigue.lastTrainedAt.toISOString(),
    };
  }

  /**
   * Builds the full standardized recovery summary.
   *
   * Every required muscle group is reported, including groups that were not
   * recently trained (those have no fatigue and therefore score 100%
   * recovered). Deterministic order: the roadmap's muscle group order.
   */
  calculateRecovery(
    fatigues: MuscleFatigue[],
    now: Date = new Date(),
  ): RecoverySummary {
    const byMuscle = new Map(fatigues.map((f) => [f.muscle, f]));

    return {
      muscles: MUSCLE_GROUPS.map((group) =>
        this.calculateMuscleRecovery(group, byMuscle.get(group) ?? null, now),
      ),
      calculatedAt: now.toISOString(),
    };
  }

  /**
   * Timeline entry for a single muscle group (Feature 6.3).
   *
   * Uses the exact same inputs as `calculateMuscleRecovery` (same baseline,
   * elapsed hours, and recovery duration), so the returned recovery percentage
   * is always identical to the Recovery Service's summary value. Untrained
   * muscles report 100% recovery with a null training timestamp and no
   * fabricated estimate.
   */
  calculateTimelineItem(
    muscle: typeof MUSCLE_GROUPS[number],
    fatigue: MuscleFatigue | null,
    now: Date = new Date(),
  ): RecoveryTimelineItem {
    if (!fatigue || fatigue.lastTrainedAt === null) {
      return {
        muscle,
        lastTrainedAt: null,
        recoveryPercentage: 100,
        estimatedFullRecoveryAt: null,
        estimatedHoursRemaining: null,
      };
    }

    // R₀ = recovery immediately after the latest workout (same baseline as the
    // summary, so percentages never diverge between card and timeline).
    const baseline = calculateRecoveryFromFatigue(
      fatigue.fatigueAtTraining ?? fatigue.fatigueScore,
      this.config,
    );

    const elapsedHours = Math.max(
      0,
      (now.getTime() - fatigue.lastTrainedAt.getTime()) / MS_PER_HOUR,
    );
    const recoveryDurationHours = this.config.recoveryHours[muscle];
    const recoveryPercentage = calculateTimeBasedRecovery({
      initialRecoveryPercentage: baseline,
      elapsedHours,
      recoveryDurationHours,
    });

    const estimate = estimateFullRecovery({
      elapsedHours,
      recoveryDurationHours,
      recoveryPercentage,
      lastTrainedAt: fatigue.lastTrainedAt,
    });

    return {
      muscle,
      lastTrainedAt: fatigue.lastTrainedAt.toISOString(),
      recoveryPercentage,
      ...estimate,
    };
  }

  /**
   * Per-muscle timeline for every roadmap muscle group, in deterministic order
   * (untrained muscles included, so the frontend never invents history).
   */
  calculateTimeline(
    fatigues: MuscleFatigue[],
    now: Date = new Date(),
  ): RecoveryTimelineItem[] {
    const byMuscle = new Map(fatigues.map((f) => [f.muscle, f]));

    return MUSCLE_GROUPS.map((group) =>
      this.calculateTimelineItem(group, byMuscle.get(group) ?? null, now),
    );
  }
}

export const recoveryCalculator = new RecoveryCalculator();