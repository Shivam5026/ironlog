import type { MuscleGroup } from "../../analytics/lib/muscleClassification";
import type {
  MuscleContributionTotal,
  MuscleContributionWeights,
  MuscleRole,
  WeightedMuscleWorkload,
} from "../types/recovery.types";

/**
 * Muscle Contribution Calculator (Feature 2.2)
 *
 * Distributes a single exercise's workload across the muscle groups it
 * involves, using the roadmap-defined contribution weights. This is kept
 * entirely separate from the fatigue score formula: it answers only
 * "how much work did each muscle get?", not "how fatigued is it?".
 *
 * Rules:
 * - Primary muscles receive 100% of the exercise's workload.
 * - Secondary muscles receive 40%.
 * - Stabilizer muscles receive 20%.
 * - A muscle assigned more than one role is counted once, at its strongest
 *   role (primary > secondary > stabilizer), so it is never double-counted.
 * - Muscles with a zero weight are dropped.
 */

export const MUSCLE_CONTRIBUTION = {
  PRIMARY: 1.0,
  SECONDARY: 0.4,
  STABILIZER: 0.2,
} as const;

export const DEFAULT_MUSCLE_CONTRIBUTION: MuscleContributionWeights = {
  primary: MUSCLE_CONTRIBUTION.PRIMARY,
  secondary: MUSCLE_CONTRIBUTION.SECONDARY,
  stabilizer: MUSCLE_CONTRIBUTION.STABILIZER,
};

/** Workload input for a single exercise. */
export interface ExerciseContributionInput {
  totalVolume: number;
  completedSets: number;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  stabilizerMuscles: MuscleGroup[];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export class MuscleContributionCalculator {
  private readonly weights: MuscleContributionWeights;

  constructor(weights: Partial<MuscleContributionWeights> = {}) {
    this.weights = { ...DEFAULT_MUSCLE_CONTRIBUTION, ...weights };
  }

  getWeights(): MuscleContributionWeights {
    return { ...this.weights };
  }

  private weightFor(role: MuscleRole): number {
    switch (role) {
      case "PRIMARY":
        return this.weights.primary;
      case "SECONDARY":
        return this.weights.secondary;
      case "STABILIZER":
        return this.weights.stabilizer;
    }
  }

  /**
   * Resolves each muscle to a single role. When a muscle appears in multiple
   * lists the strongest role wins, preventing duplicate contributions.
   */
  resolveRoles(input: ExerciseContributionInput): Map<MuscleGroup, MuscleRole> {
    const roles = new Map<MuscleGroup, MuscleRole>();

    // Ordered strongest → weakest so the first assignment wins.
    for (const muscle of input.primaryMuscles) {
      if (!roles.has(muscle)) roles.set(muscle, "PRIMARY");
    }
    for (const muscle of input.secondaryMuscles) {
      if (!roles.has(muscle)) roles.set(muscle, "SECONDARY");
    }
    for (const muscle of input.stabilizerMuscles) {
      if (!roles.has(muscle)) roles.set(muscle, "STABILIZER");
    }

    return roles;
  }

  /**
   * Distributes an exercise's workload across its muscles.
   * Returns one entry per muscle (deduplicated), dropping zero-weight roles.
   */
  distribute(input: ExerciseContributionInput): WeightedMuscleWorkload[] {
    const roles = this.resolveRoles(input);
    const result: WeightedMuscleWorkload[] = [];

    for (const [muscle, role] of roles) {
      const weight = this.weightFor(role);
      if (weight <= 0) continue;

      result.push({
        muscle,
        role,
        weight,
        weightedVolume: round(input.totalVolume * weight),
        weightedSets: round(input.completedSets * weight),
      });
    }

    return result;
  }

  /**
   * Distributes and aggregates several exercises into per-muscle totals,
   * aggregated by normalized muscle group.
   */
  aggregate(
    inputs: ExerciseContributionInput[],
  ): MuscleContributionTotal[] {
    const totals = new Map<MuscleGroup, MuscleContributionTotal>();

    for (const input of inputs) {
      for (const contribution of this.distribute(input)) {
        let total = totals.get(contribution.muscle);
        if (!total) {
          total = {
            muscle: contribution.muscle,
            weightedVolume: 0,
            weightedSets: 0,
            primaryVolume: 0,
            secondaryVolume: 0,
            stabilizerVolume: 0,
          };
          totals.set(contribution.muscle, total);
        }

        total.weightedVolume = round(
          total.weightedVolume + contribution.weightedVolume,
        );
        total.weightedSets = round(
          total.weightedSets + contribution.weightedSets,
        );

        if (contribution.role === "PRIMARY") {
          total.primaryVolume = round(
            total.primaryVolume + contribution.weightedVolume,
          );
        } else if (contribution.role === "SECONDARY") {
          total.secondaryVolume = round(
            total.secondaryVolume + contribution.weightedVolume,
          );
        } else {
          total.stabilizerVolume = round(
            total.stabilizerVolume + contribution.weightedVolume,
          );
        }
      }
    }

    return Array.from(totals.values());
  }
}

export const muscleContributionCalculator = new MuscleContributionCalculator();
