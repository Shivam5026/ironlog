import type { MuscleGroup } from "../../analytics/lib/muscleClassification";
import type {
  ExerciseAlternative,
  ExerciseCandidate,
  ExerciseRecommendation,
  ExerciseRecommendationConfig,
  ExerciseRecommendationInput,
  ExerciseRecommendationsResponse,
} from "../types/recovery.types";

/**
 * Exercise Recommendation Calculator (Feature 5.2)
 *
 * Deterministic ranking engine that turns today's workout recommendation
 * (Feature 5.1), per-muscle recovery (Epic 3) and a pool of candidate
 * exercises (the user's own exercise library plus optional ExerciseDB
 * enrichment) into a list of recommended exercises with lower-fatigue
 * alternatives and today's high-priority muscles.
 *
 * No exercise is ever labeled "inherently low-fatigue" — external metadata
 * does not carry load/sets/intensity. Instead "lower-fatigue" means a
 * strictly better option *for today*: an alternative whose target muscles
 * have higher measured recovery.
 *
 * The exact ranking weights are not prescribed by the roadmap, so they are
 * configurable defaults. This is an initial strategy, not a medically
 * validated prescription.
 */

export const DEFAULT_EXERCISE_RECOMMENDATION_CONFIG: ExerciseRecommendationConfig =
  {
    // Muscles at/above this recovery count as "sufficiently recovered".
    recoveredMuscleThreshold: 70,
    // Muscles below this are "heavily fatigued" and sink in the ranking.
    fatiguedMuscleThreshold: 40,
    maxRecommendations: 6,
    maxAlternativesPerExercise: 3,
    // Keep exercises the user's equipment cannot support out of the results.
    equipmentStrict: true,
    // How far back muscle recovery (and recommendation context) is evaluated.
    recoveryLookbackDays: 7,
    // How far back recent sessions feed the user's exercise library.
    libraryLookbackDays: 90,
    // ExerciseDB search limit used when enriching the exercise library.
    enrichmentLimitPerMuscle: 10,
  };

function mean(values: number[]): number {
  if (values.length === 0) return 100;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Recovery of an exercise = mean recovery of its target muscles. An exercise
 * with no identifiable target muscles is treated as neutral (100) rather than
 * penalized, since we assume nothing about its fatigue load.
 */
export function exerciseRecoveryPercentage(
  candidate: ExerciseCandidate,
  muscleRecovery: Record<MuscleGroup, number>,
): number {
  const groups = candidate.targetMuscles;
  if (groups.length === 0) return 100;
  return mean(groups.map((muscle) => muscleRecovery[muscle] ?? 100));
}

/**
 * High-priority muscles are those today's workout focuses on AND that are
 * sufficiently recovered. Order follows the recommendation's target order.
 */
export function identifyPriorityMuscles(
  recommendedTargetMuscles: MuscleGroup[],
  muscleRecovery: Record<MuscleGroup, number>,
  threshold = DEFAULT_EXERCISE_RECOMMENDATION_CONFIG.recoveredMuscleThreshold,
): MuscleGroup[] {
  return recommendedTargetMuscles.filter(
    (muscle) => (muscleRecovery[muscle] ?? 100) >= threshold,
  );
}

/** Whether the user's equipment set can cover the candidate (or no constraint). */
export function equipmentMatches(
  candidate: ExerciseCandidate,
  availableEquipment: string[],
): boolean {
  if (availableEquipment.length === 0) return true;
  const needs = candidate.equipments ?? [];
  // Missing equipment metadata is treated as compatible so the exercise is
  // still considered and then handled by ranking.
  if (needs.length === 0) return true;
  return needs.some((item) => availableEquipment.includes(item));
}

function sharesTargetMuscles(
  a: ExerciseCandidate,
  b: ExerciseCandidate,
): MuscleGroup[] {
  return Array.from(
    new Set(b.targetMuscles.filter((muscle) => a.targetMuscles.includes(muscle))),
  );
}

function equipmentNote(a: ExerciseCandidate, b: ExerciseCandidate): string {
  const aSet = new Set(a.equipments ?? []);
  const bSet = new Set(b.equipments ?? []);
  if (aSet.size === 0 || bSet.size === 0) return "";
  const differs =
    [...aSet].some((item) => !bSet.has(item)) ||
    [...bSet].some((item) => !aSet.has(item));
  return differs ? " using different equipment" : "";
}

function buildReason(
  candidate: ExerciseCandidate,
  recoveryPercentage: number,
  priority: MuscleGroup[],
  muscleRecovery: Record<MuscleGroup, number>,
  title: string | undefined,
  fatiguedMuscleThreshold: number,
): string {
  if (candidate.targetMuscles.length === 0) {
    return (
      "Exercise metadata is incomplete, so its readiness is treated as " +
      `neutral (${recoveryPercentage}%).`
    );
  }

  const fatigued = candidate.targetMuscles.filter(
    (muscle) => (muscleRecovery[muscle] ?? 100) < fatiguedMuscleThreshold,
  );
  const focus = priority.filter((muscle) =>
    candidate.targetMuscles.includes(muscle),
  );

  if (fatigued.length > 0) {
    const base =
      `Targets ${fatigued.join(", ")}, at or below ${fatiguedMuscleThreshold}% ` +
      "recovery — deprioritized as a demanding option for today.";
    if (focus.length > 0) {
      return (
        base +
        ` Still aligned with today's ${title ?? "workout"} focus through ` +
        `${focus.join(", ")} (${recoveryPercentage}% average).`
      );
    }
    return base;
  }

  if (focus.length > 0) {
    return (
      `Targets ${focus.join(", ")}, which are sufficiently recovered ` +
      `(${recoveryPercentage}%) and part of today's ${title ?? "workout"} focus.`
    );
  }

  return (
    `Targets ${candidate.targetMuscles.join(", ")} at ${recoveryPercentage}% ` +
    "muscle recovery."
  );
}

interface RankedCandidate {
  candidate: ExerciseCandidate;
  recoveryPercentage: number;
  equipmentOk: boolean;
  hasPriorityTarget: boolean;
  hasFatiguedTarget: boolean;
}

/**
 * Ranks every candidate deterministically. Deterministic order:
*  1. does not heavily target a fatigued muscle (deprioritize those first);
 *   2. targets a high-priority (recovered, today-focus) muscle;
 *   3. is compatible with the user's equipment;
 *   4. higher target-muscle recovery;
 *   5. alphabetical name, then id (stable tie-break).
 */
function rankCandidates(
  candidates: ExerciseCandidate[],
  priority: MuscleGroup[],
  muscleRecovery: Record<MuscleGroup, number>,
  availableEquipment: string[],
  config: ExerciseRecommendationConfig,
): RankedCandidate[] {
  const ranked = candidates.map((candidate) => ({
    candidate,
    recoveryPercentage: exerciseRecoveryPercentage(candidate, muscleRecovery),
    equipmentOk: equipmentMatches(candidate, availableEquipment),
    hasPriorityTarget: candidate.targetMuscles.some((muscle) =>
      priority.includes(muscle),
    ),
    hasFatiguedTarget: candidate.targetMuscles.some(
      (muscle) => (muscleRecovery[muscle] ?? 100) < config.fatiguedMuscleThreshold,
    ),
  }));

  const pool = config.equipmentStrict
    ? ranked.filter((entry) => entry.equipmentOk)
    : ranked;

  return pool.sort((a, b) => {
    if (a.hasFatiguedTarget !== b.hasFatiguedTarget) {
      return a.hasFatiguedTarget ? 1 : -1;
    }
    if (a.hasPriorityTarget !== b.hasPriorityTarget) {
      return a.hasPriorityTarget ? -1 : 1;
    }
    if (a.equipmentOk !== b.equipmentOk) return a.equipmentOk ? -1 : 1;
    const recoveryDiff = b.recoveryPercentage - a.recoveryPercentage;
    if (recoveryDiff !== 0) return recoveryDiff;
    const nameDiff = a.candidate.exerciseName.localeCompare(b.candidate.exerciseName);
    if (nameDiff !== 0) return nameDiff;
    return a.candidate.exerciseId.localeCompare(b.candidate.exerciseId);
  });
}

function buildAlternatives(
  recommended: RankedCandidate,
  all: RankedCandidate[],
  config: ExerciseRecommendationConfig,
): ExerciseAlternative[] {
  const source = all
    .filter(
      (entry) => entry.candidate.exerciseId !== recommended.candidate.exerciseId,
    )
    .filter(
      (entry) => sharesTargetMuscles(recommended.candidate, entry.candidate).length > 0,
    )
    .sort((a, b) => {
      if (a.equipmentOk !== b.equipmentOk) return a.equipmentOk ? -1 : 1;
      const recoveryDiff = b.recoveryPercentage - a.recoveryPercentage;
      if (recoveryDiff !== 0) return recoveryDiff;
      return a.candidate.exerciseName.localeCompare(b.candidate.exerciseName);
    });

  return source
    .slice(0, config.maxAlternativesPerExercise)
    .map((entry) => {
      const shared = sharesTargetMuscles(recommended.candidate, entry.candidate);
      const sharedLabel = shared.slice(0, 2).join(", ");
      const note = equipmentNote(recommended.candidate, entry.candidate);

      const reason =
        entry.recoveryPercentage > recommended.recoveryPercentage
          ? `Lower-fatigue option for today: also targets ${sharedLabel} with ` +
            `higher muscle recovery (${entry.recoveryPercentage}% vs ` +
            `${recommended.recoveryPercentage}%).`
          : `Similar muscle focus: also targets ${sharedLabel}${note}.`;

      return {
        exerciseId: entry.candidate.exerciseId,
        exerciseName: entry.candidate.exerciseName,
        reason,
      };
    });
}

export class ExerciseRecommendationCalculator {
  private readonly config: ExerciseRecommendationConfig;

  constructor(config: Partial<ExerciseRecommendationConfig> = {}) {
    this.config = { ...DEFAULT_EXERCISE_RECOMMENDATION_CONFIG, ...config };
  }

  getConfig(): ExerciseRecommendationConfig {
    return { ...this.config };
  }

  calculate(
    input: ExerciseRecommendationInput,
    now: Date = new Date(),
  ): ExerciseRecommendationsResponse {
    const priority = identifyPriorityMuscles(
      input.recommendedTargetMuscles,
      input.muscleRecovery,
      this.config.recoveredMuscleThreshold,
    );

    // Rest/active-recovery days have no training focus, so no exercises to
    // pick from; an empty library also resolves to an empty (safe) result.
    if (
      input.recommendedTargetMuscles.length === 0 ||
      input.candidates.length === 0
    ) {
      return {
        recommendedExercises: [],
        priorityMuscles: priority,
        generatedAt: now.toISOString(),
      };
    }

    const ranked = rankCandidates(
      input.candidates,
      priority,
      input.muscleRecovery,
      input.availableEquipment,
      this.config,
    );

    const recommendedExercises = ranked
      .slice(0, this.config.maxRecommendations)
      .map((entry): ExerciseRecommendation => {
        const alternatives = buildAlternatives(entry, ranked, this.config);
        return {
          exerciseId: entry.candidate.exerciseId,
          exerciseName: entry.candidate.exerciseName,
          targetMuscles: entry.candidate.targetMuscles,
          recoveryPercentage: entry.recoveryPercentage,
          reason: buildReason(
            entry.candidate,
            entry.recoveryPercentage,
            priority,
            input.muscleRecovery,
            input.recommendationTitle,
            this.config.fatiguedMuscleThreshold,
          ),
          alternatives,
        };
      });

    return {
      recommendedExercises,
      priorityMuscles: priority,
      generatedAt: now.toISOString(),
    };
  }
}

export const exerciseRecommendationCalculator = new ExerciseRecommendationCalculator();