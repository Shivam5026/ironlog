import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import {
  MuscleContributionCalculator,
  DEFAULT_MUSCLE_CONTRIBUTION,
} from "./muscle-contribution.calculator";
import type {
  ExerciseWorkload,
  FatigueCalculatorConfig,
  MuscleFatigue,
  MuscleFatigueFactors,
} from "../types/recovery.types";

/**
 * Fatigue Calculator (Feature 2.1, extended by Feature 2.2)
 *
 * Pure, deterministic fatigue math. Given normalized per-exercise workloads
 * and a reference time, it produces a fatigue score per muscle group using the
 * six roadmap factors: volume, set count, intensity, frequency, primary
 * muscles, and secondary muscles.
 *
 * Design notes:
 * - No database, network, or exercise metadata access. All inputs arrive
 *   pre-normalized from FatigueService.
 * - Fully deterministic: identical inputs (including `now`) yield identical
 *   scores. There is no hidden clock or randomness here.
 * - Workload is distributed across muscles by MuscleContributionCalculator
 *   (Feature 2.2), keeping contribution weighting separate from scoring.
 * - The score range, lookback window, normalization references, factor
 *   weights, and muscle contributions are all configurable.
 * - Recovery percentages and time-to-recover are explicitly NOT modelled here;
 *   those belong to Epic 3.
 */

export const DEFAULT_FATIGUE_CONFIG: FatigueCalculatorConfig = {
  scoreMin: 0,
  scoreMax: 100,
  lookbackHours: 7 * 24, // one week
  volumeReference: 10_000, // weighted volume that saturates the volume factor
  setsReference: 20, // weighted sets that saturate the set factor
  frequencyReference: 5, // sessions in the window that saturate frequency
  intensityFallback: 0.5, // neutral value when intensity is unavailable
  factorWeights: {
    volume: 0.3,
    sets: 0.25,
    intensity: 0.15,
    frequency: 0.15,
    recency: 0.15,
  },
  // Roadmap-defined contribution weights (Feature 2.2). Still configurable.
  contributions: { ...DEFAULT_MUSCLE_CONTRIBUTION },
};

const MS_PER_HOUR = 3_600_000;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

interface MuscleAccumulator {
  totalVolume: number;
  totalSets: number;
  sessionIds: Set<string>;
  lastTrainedAt: Date | null;
  intensityWeightedSum: number;
  intensityWeightSum: number;
  intensityAvailable: boolean;
}

function emptyAccumulator(): MuscleAccumulator {
  return {
    totalVolume: 0,
    totalSets: 0,
    sessionIds: new Set<string>(),
    lastTrainedAt: null,
    intensityWeightedSum: 0,
    intensityWeightSum: 0,
    intensityAvailable: false,
  };
}

export class FatigueCalculator {
  private readonly config: FatigueCalculatorConfig;
  private readonly contributionCalculator: MuscleContributionCalculator;

  constructor(config: Partial<FatigueCalculatorConfig> = {}) {
    this.config = {
      ...DEFAULT_FATIGUE_CONFIG,
      ...config,
      factorWeights: {
        ...DEFAULT_FATIGUE_CONFIG.factorWeights,
        ...(config.factorWeights ?? {}),
      },
      contributions: {
        ...DEFAULT_FATIGUE_CONFIG.contributions,
        ...(config.contributions ?? {}),
      },
    };

    this.contributionCalculator = new MuscleContributionCalculator(
      this.config.contributions,
    );
  }

  getConfig(): FatigueCalculatorConfig {
    return {
      ...this.config,
      factorWeights: { ...this.config.factorWeights },
      contributions: { ...this.config.contributions },
    };
  }

  /** Exposes the contribution calculator for reuse and testing. */
  getContributionCalculator(): MuscleContributionCalculator {
    return this.contributionCalculator;
  }

  private isWithinLookback(exercise: ExerciseWorkload, now: Date): boolean {
    const ageHours =
      (now.getTime() - new Date(exercise.lastPerformedAt).getTime()) / MS_PER_HOUR;
    return ageHours <= this.config.lookbackHours;
  }

  /**
   * Aggregates exercise workloads into per-muscle fatigue scores.
   * Muscles with no contributing load are omitted.
   */
  calculateMuscleFatigue(
    exercises: ExerciseWorkload[],
    now: Date = new Date(),
  ): MuscleFatigue[] {
    const accumulators = new Map<MuscleGroup, MuscleAccumulator>();

    for (const exercise of exercises) {
      // Defensive: never let data outside the window influence the model,
      // even if the caller did not filter it.
      if (!this.isWithinLookback(exercise, now)) continue;

      const contributions = this.contributionCalculator.distribute({
        totalVolume: exercise.totalVolume,
        completedSets: exercise.completedSets,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        stabilizerMuscles: exercise.stabilizerMuscles,
      });
      if (contributions.length === 0) continue;

      for (const contribution of contributions) {
        let acc = accumulators.get(contribution.muscle);
        if (!acc) {
          acc = emptyAccumulator();
          accumulators.set(contribution.muscle, acc);
        }

        acc.totalVolume += contribution.weightedVolume;
        acc.totalSets += contribution.weightedSets;

        for (const sessionId of exercise.sessionIds) {
          acc.sessionIds.add(sessionId);
        }

        const performedAt = new Date(exercise.lastPerformedAt);
        if (!acc.lastTrainedAt || performedAt > acc.lastTrainedAt) {
          acc.lastTrainedAt = performedAt;
        }

        // Intensity is averaged with weighted volume as the weight, and only
        // counts when the exercise actually reported a reliable value.
        if (exercise.averageIntensity !== null) {
          const w = Math.max(contribution.weightedVolume, 1);
          acc.intensityWeightedSum +=
            clamp01(exercise.averageIntensity) * w;
          acc.intensityWeightSum += w;
          acc.intensityAvailable = true;
        }
      }
    }

    const result: MuscleFatigue[] = [];
    for (const muscle of MUSCLE_GROUPS) {
      const acc = accumulators.get(muscle);
      if (!acc) continue;
      if (acc.totalVolume <= 0 && acc.totalSets <= 0) continue;

      result.push(this.buildMuscleFatigue(muscle, acc, now));
    }

    // Deterministic ordering: strongest fatigue first, then name.
    result.sort((a, b) => {
      if (b.fatigueScore !== a.fatigueScore) {
        return b.fatigueScore - a.fatigueScore;
      }
      return a.muscle.localeCompare(b.muscle);
    });

    return result;
  }

  private buildMuscleFatigue(
    muscle: MuscleGroup,
    acc: MuscleAccumulator,
    now: Date,
  ): MuscleFatigue {
    const lastTrainedAt = acc.lastTrainedAt;

    const recencyHours =
      lastTrainedAt === null
        ? Number.POSITIVE_INFINITY
        : Math.max(0, (now.getTime() - lastTrainedAt.getTime()) / MS_PER_HOUR);

    const volumeFactor = clamp01(acc.totalVolume / this.config.volumeReference);
    const setsFactor = clamp01(acc.totalSets / this.config.setsReference);
    const frequencyFactor = clamp01(
      acc.sessionIds.size / this.config.frequencyReference,
    );
    const recencyFactor = clamp01(
      1 - recencyHours / this.config.lookbackHours,
    );
    const intensityValue =
      acc.intensityWeightSum > 0
        ? acc.intensityWeightedSum / acc.intensityWeightSum
        : this.config.intensityFallback;
    const intensityFactor = clamp01(intensityValue);

    const factors: MuscleFatigueFactors = {
      volume: volumeFactor,
      sets: setsFactor,
      intensity: intensityFactor,
      intensityAvailable: acc.intensityAvailable,
      frequency: frequencyFactor,
      recency: recencyFactor,
    };

    const weights = this.config.factorWeights;
    const weightSum =
      weights.volume +
      weights.sets +
      weights.intensity +
      weights.frequency +
      weights.recency;

    const blend =
      weightSum > 0
        ? (weights.volume * factors.volume +
            weights.sets * factors.sets +
            weights.intensity * factors.intensity +
            weights.frequency * factors.frequency +
            weights.recency * factors.recency) /
          weightSum
        : 0;

    const score =
      this.config.scoreMin +
      clamp01(blend) * (this.config.scoreMax - this.config.scoreMin);

    // Fatigue immediately after the latest workout: the only time-dependent
    // factor is recency, so restoring it to its peak (1) yields the value the
    // muscle would have scored right after training. Feature 3.2 uses it as
    // the baseline for explicit time-based recovery, preventing the recency
    // decay already inside `fatigueScore` from being counted twice.
    const trainingBlend =
      weightSum > 0
        ? (weights.volume * factors.volume +
            weights.sets * factors.sets +
            weights.intensity * factors.intensity +
            weights.frequency * factors.frequency +
            weights.recency * 1) /
          weightSum
        : 0;
    const trainingScore =
      this.config.scoreMin +
      clamp01(trainingBlend) * (this.config.scoreMax - this.config.scoreMin);

    const clampToRange = (value: number) =>
      Math.min(
        this.config.scoreMax,
        Math.max(this.config.scoreMin, Math.round(value)),
      );

    return {
      muscle,
      fatigueScore: clampToRange(score),
      fatigueAtTraining: clampToRange(trainingScore),
      totalVolume: round(acc.totalVolume),
      totalSets: round(acc.totalSets),
      lastTrainedAt,
      factors,
    };
  }
}

export const fatigueCalculator = new FatigueCalculator();
