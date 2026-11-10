import type { MuscleGroup } from "../../analytics/lib/muscleClassification";
import type {
  RecommendationCalculatorConfig,
  RecommendationInput,
  TodayRecommendation,
  TrainingSplit,
  WorkoutRecommendationType,
} from "../types/recovery.types";

/**
 * Recommendation Calculator (Feature 5.1)
 *
 * Deterministic, configurable decision engine that picks one of the five
 * roadmap recommendations for today. It consumes inputs the services already
 * produce — readiness (Feature 4.1/4.2), per-muscle recovery (Epic 3), and a
 * lightweight training-split history — and never recomputes fatigue itself.
 *
 * Decision order matches the roadmap flow:
 *   1. readiness score below the rest threshold      → Take a Rest Day
 *   2. significant accumulated fatigue (long streak) → Active Recovery
 *   3. a suitably recovered training split exists     → Train Push / Pull / Legs
 *   4. otherwise                                     → Active Recovery
 *
 * When several splits are fit, the best one is chosen deterministically from
 * recent training history (freshest overall, least recently trained split,
 * avoiding repetition) rather than at random.
 *
 * This is an initial decision strategy, not a medically validated training
 * prescription. All thresholds are configurable defaults.
 */

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationCalculatorConfig = {
  // Readiness score below this → rest day (aligned with the LOW level default).
  restReadinessThreshold: 40,
  // Five consecutive training days already signal accumulated fatigue.
  fatigueStreakThreshold: 5,
  // A split is only recommended when every one of its muscles is at or above
  // this recovery level, so fatigued groups are avoided when possible.
  groupRecoveryThreshold: 70,
  // How far back muscle recovery (and split suitability) is evaluated.
  recoveryWindowDays: 7,
  // How far back recent training-split history is counted.
  splitHistoryWindowDays: 14,
};

/** Which muscle groups each training split prioritizes. */
export const RECOMMENDATION_GROUP_MUSCLES: Record<TrainingSplit, MuscleGroup[]> =
  {
    PUSH: ["Chest", "Shoulders", "Triceps"],
    PULL: ["Back", "Biceps", "Forearms"],
    LEGS: ["Legs", "Glutes", "Hamstrings", "Calves", "Core"],
  };

/** Stable ordering so ties resolve the same way every time. */
export const TRAINING_SPLIT_ORDER: TrainingSplit[] = ["PUSH", "PULL", "LEGS"];

export const RECOMMENDATION_TITLES: Record<WorkoutRecommendationType, string> = {
  TRAIN_PUSH: "Train Push",
  TRAIN_PULL: "Train Pull",
  TRAIN_LEGS: "Train Legs",
  ACTIVE_RECOVERY: "Active Recovery",
  REST_DAY: "Take a Rest Day",
};

/** Maps a muscle group onto the split that prioritizes it. */
export function muscleToSplit(muscle: MuscleGroup): TrainingSplit | null {
  for (const split of TRAINING_SPLIT_ORDER) {
    if (RECOMMENDATION_GROUP_MUSCLES[split].includes(muscle)) return split;
  }
  return null;
}

/**
 * Mean recovery of a split's muscles. A muscle not tracked as trained reports
 * full recovery from the underlying engine, so it never pulls a split down.
 */
export function splitRecoveryPercentage(
  recovery: Record<MuscleGroup, number>,
  split: TrainingSplit,
): number {
  const muscles = RECOMMENDATION_GROUP_MUSCLES[split];
  const sum = muscles.reduce((acc, muscle) => acc + (recovery[muscle] ?? 0), 0);
  return Math.round(sum / muscles.length);
}

/** A split is suitable when every muscle in it meets the recovery threshold. */
export function isSplitRecovered(
  recovery: Record<MuscleGroup, number>,
  split: TrainingSplit,
  threshold = DEFAULT_RECOMMENDATION_CONFIG.groupRecoveryThreshold,
): boolean {
  return RECOMMENDATION_GROUP_MUSCLES[split].every(
    (muscle) => (recovery[muscle] ?? 0) >= threshold,
  );
}

/**
 * Picks the best suitable split without randomness: freshest overall first,
 * then the split with the fewest recent sessions, then one that does not
 * repeat the last trained split, then the canonical order.
 */
export function pickSuitableSplit(
  suitable: TrainingSplit[],
  splitSessionCounts: Record<TrainingSplit, number>,
  lastTrainedSplit: TrainingSplit | null,
): TrainingSplit | null {
  if (suitable.length === 0) return null;

  const count = (split: TrainingSplit): number =>
    splitSessionCounts[split] ?? 0;
  const repeatsLast = (split: TrainingSplit): number =>
    split === lastTrainedSplit ? 1 : 0;

  return [...suitable].sort((a, b) => {
    const countDiff = count(a) - count(b);
    if (countDiff !== 0) return countDiff;
    const repeatDiff = repeatsLast(a) - repeatsLast(b);
    if (repeatDiff !== 0) return repeatDiff;
    return TRAINING_SPLIT_ORDER.indexOf(a) - TRAINING_SPLIT_ORDER.indexOf(b);
  })[0];
}

export interface RecommendationDecision {
  type: WorkoutRecommendationType;
  targetMuscles: string[];
}

/** Rule 1: readiness too low to train at all. */
export function decideRestDay(
  input: RecommendationInput,
  config: RecommendationCalculatorConfig,
): boolean {
  return input.readinessScore < config.restReadinessThreshold;
}

/** Rule 2: a long consecutive-training streak implies accumulated fatigue. */
export function decideActiveRecoveryForStreak(
  input: RecommendationInput,
  config: RecommendationCalculatorConfig,
): boolean {
  return input.consecutiveTrainingDays >= config.fatigueStreakThreshold;
}

/** Rule 3: choose a suitable training split, or none. */
export function decideTrainingSplit(
  input: RecommendationInput,
  config: RecommendationCalculatorConfig,
): TrainingSplit | null {
  const suitable = TRAINING_SPLIT_ORDER.filter((split) =>
    isSplitRecovered(input.muscleRecovery, split, config.groupRecoveryThreshold),
  );
  return pickSuitableSplit(
    suitable,
    input.splitSessionCounts,
    input.lastTrainedSplit,
  );
}

export function decideRecommendation(
  input: RecommendationInput,
  config: RecommendationCalculatorConfig = DEFAULT_RECOMMENDATION_CONFIG,
): RecommendationDecision {
  if (decideRestDay(input, config)) {
    return { type: "REST_DAY", targetMuscles: [] };
  }

  if (decideActiveRecoveryForStreak(input, config)) {
    return { type: "ACTIVE_RECOVERY", targetMuscles: [] };
  }

  const split = decideTrainingSplit(input, config);
  if (split) {
    return {
      type: splitToRecommendationType(split),
      targetMuscles: [...RECOMMENDATION_GROUP_MUSCLES[split]],
    };
  }

  return { type: "ACTIVE_RECOVERY", targetMuscles: [] };
}

function splitToRecommendationType(split: TrainingSplit): WorkoutRecommendationType {
  switch (split) {
    case "PUSH":
      return "TRAIN_PUSH";
    case "PULL":
      return "TRAIN_PULL";
    case "LEGS":
      return "TRAIN_LEGS";
  }
}

/** Builds the human-readable reason explaining the recommendation. */
export function buildRecommendationReason(
  input: RecommendationInput,
  decision: RecommendationDecision,
  config: RecommendationCalculatorConfig,
): string {
  const levelLabel = String(input.readinessLevel);

  switch (decision.type) {
    case "REST_DAY":
      return (
        `Readiness score ${input.readinessScore} (${levelLabel}) is below the ` +
        `${config.restReadinessThreshold} rest threshold. Recovery indicators ` +
        `suggest substantial accumulated fatigue — take a rest day.`
      );
    case "ACTIVE_RECOVERY":
      if (
        decideActiveRecoveryForStreak(input, config)
      ) {
        return (
          `You have trained ${input.consecutiveTrainingDays} consecutive days. ` +
          `That level of accumulated fatigue suggests lighter movement and ` +
          `active recovery instead of a demanding session.`
        );
      }
      return (
        "No training split has every muscle sufficiently recovered right now " +
        `(needs ${config.groupRecoveryThreshold}% or better). Consider lighter ` +
        "movement and active recovery today."
      );
    default: {
      const split = TRAINING_SPLIT_ORDER.find(
        (s) => splitToRecommendationType(s) === decision.type,
      );
      if (!split) return "No training split selected.";
      const average = splitRecoveryPercentage(input.muscleRecovery, split);
      const muscles = RECOMMENDATION_GROUP_MUSCLES[split].join(", ");

      let preference: string;
      if (input.lastTrainedSplit === null) {
        preference = "";
      } else if (input.lastTrainedSplit !== split) {
        preference =
          " It is also the least recently trained of your recovered splits.";
      } else {
        preference =
          " It continues your recent training pattern.";
      }

      return (
        `Readiness score ${input.readinessScore} (${levelLabel}) supports training. ` +
        `${split} muscles (${muscles}) average ${average}% recovery.` +
        preference
      );
    }
  }
}

export class RecommendationCalculator {
  private readonly config: RecommendationCalculatorConfig;

  constructor(config: Partial<RecommendationCalculatorConfig> = {}) {
    this.config = { ...DEFAULT_RECOMMENDATION_CONFIG, ...config };
  }

  getConfig(): RecommendationCalculatorConfig {
    return { ...this.config };
  }

  /** Runs the decision flow, including the human-readable explanation. */
  calculate(input: RecommendationInput, now: Date = new Date()): TodayRecommendation {
    const decision = decideRecommendation(input, this.config);
    return {
      type: decision.type,
      title: RECOMMENDATION_TITLES[decision.type],
      reason: buildRecommendationReason(input, decision, this.config),
      readinessScore: input.readinessScore,
      readinessLevel: input.readinessLevel,
      targetMuscles: decision.targetMuscles,
      generatedAt: now.toISOString(),
    };
  }
}

export const recommendationCalculator = new RecommendationCalculator();