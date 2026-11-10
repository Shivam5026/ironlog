import { prisma } from "../../../config/prisma";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import { getExerciseById } from "../../exercise/exerciseDb.service";
import { FatigueCalculator } from "../utils/fatigue.calculator";
import { MuscleContributionCalculator } from "../utils/muscle-contribution.calculator";
import {
  resolveMuscleRoles,
  type ExerciseMetadataFetcher,
} from "../utils/muscleRoles";
import type {
  ExerciseWorkload,
  FatigueCalculatorConfig,
  MuscleContributionTotal,
  MuscleContributionWeights,
  MuscleFatigue,
} from "../types/recovery.types";

/**
 * Fatigue Service (Feature 2.1, extended by Feature 2.2)
 *
 * Retrieves completed workout history and aggregates it into normalized
 * per-exercise workloads, then delegates the deterministic math to
 * FatigueCalculator. Feature 2.2's MuscleContributionCalculator distributes
 * each exercise's workload across its primary, secondary, and stabilizer
 * muscles before the fatigue factors are computed.
 *
 * This service owns data access and normalization only. It does not encode
 * scoring rules, and it does not fabricate intensity: when no reliable
 * intensity data exists, `averageIntensity` is null and the calculator
 * applies a consistent, configurable fallback.
 */

export interface FatigueOptions {
  /** Reference time. Also anchors the default lookback window. */
  now?: Date;
  /** Restrict to sessions ending on/after this date (overrides lookback). */
  since?: Date;
  /** Override the lookback window for this calculation. */
  lookbackHours?: number;
  /** Override calculator configuration for this calculation. */
  config?: Partial<FatigueCalculatorConfig>;
  /** Override contribution weights for this calculation. */
  contributionWeights?: Partial<MuscleContributionWeights>;
}

interface ExerciseLogWithSets {
  exerciseId: string;
  exerciseName: string;
  workoutSession: { id: string; endedAt: Date | null };
  sets: {
    weight: unknown;
    reps: number;
    setType: "WARMUP" | "WORKING" | "FAILURE";
    rpe: unknown;
  }[];
}

interface ExerciseAccumulator {
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
  completedSets: number;
  sessionIds: Set<string>;
  lastPerformedAt: Date | null;
  rpeValues: number[];
}

const MS_PER_HOUR = 3_600_000;

/**
 * Normalizes a recorded RPE (typically 1-10) to 0-1.
 * Returns null for missing or out-of-range values so intensity is only
 * counted when it is trustworthy.
 */
function normalizeRpe(rpe: unknown): number | null {
  if (rpe === null || rpe === undefined) return null;
  const value = Number(rpe);
  if (!Number.isFinite(value)) return null;
  if (value < 1 || value > 10) return null;
  return value / 10;
}

export class FatigueService {
  private readonly repository: AnalyticsRepository;
  private readonly calculator: FatigueCalculator;
  private readonly fetchExerciseMetadata: ExerciseMetadataFetcher;

  constructor(
    repository: AnalyticsRepository = new AnalyticsRepository(prisma),
    calculator: FatigueCalculator = new FatigueCalculator(),
    fetchExerciseMetadata: ExerciseMetadataFetcher = getExerciseById,
  ) {
    this.repository = repository;
    this.calculator = calculator;
    this.fetchExerciseMetadata = fetchExerciseMetadata;
  }

  private resolveLookbackHours(options: FatigueOptions): number {
    if (options.lookbackHours !== undefined) return options.lookbackHours;
    if (options.config?.lookbackHours !== undefined) {
      return options.config.lookbackHours;
    }
    return this.calculator.getConfig().lookbackHours;
  }

  /**
   * Normalizes completed workout history into per-exercise workloads.
   * Incomplete sets are already excluded by the repository; warmup sets are
   * excluded here because they are not a training stimulus.
   */
  private normalizeLogs(
    logs: ExerciseLogWithSets[],
  ): ExerciseAccumulator[] {
    const byExercise = new Map<string, ExerciseAccumulator>();

    for (const log of logs) {
      const endedAt = log.workoutSession.endedAt;
      if (!endedAt) continue; // cannot place this work in time; skip defensively

      for (const set of log.sets) {
        if (set.setType !== "WORKING") continue;

        const weight = Number(set.weight);
        if (!Number.isFinite(weight) || weight <= 0) continue;
        if (set.reps <= 0) continue;

        let acc = byExercise.get(log.exerciseId);
        if (!acc) {
          acc = {
            exerciseId: log.exerciseId,
            exerciseName: log.exerciseName,
            totalVolume: 0,
            completedSets: 0,
            sessionIds: new Set<string>(),
            lastPerformedAt: null,
            rpeValues: [],
          };
          byExercise.set(log.exerciseId, acc);
        }

        acc.totalVolume += weight * set.reps;
        acc.completedSets += 1;
        acc.sessionIds.add(log.workoutSession.id);

        if (!acc.lastPerformedAt || endedAt > acc.lastPerformedAt) {
          acc.lastPerformedAt = endedAt;
        }

        const intensity = normalizeRpe(set.rpe);
        if (intensity !== null) {
          acc.rpeValues.push(intensity);
        }
      }
    }

    return Array.from(byExercise.values());
  }

  /** Returns normalized per-exercise workloads within the lookback window. */
  async getExerciseWorkloads(
    userId: string,
    options: FatigueOptions = {},
  ): Promise<ExerciseWorkload[]> {
    const now = options.now ?? new Date();
    const lookbackHours = this.resolveLookbackHours(options);
    const since =
      options.since ?? new Date(now.getTime() - lookbackHours * MS_PER_HOUR);

    const logs = (await this.repository.getAllExerciseLogsWithSets(userId, {
      startDate: since,
    })) as ExerciseLogWithSets[];

    if (logs.length === 0) return [];

    const accumulators = this.normalizeLogs(logs);
    if (accumulators.length === 0) return [];

    return Promise.all(
      accumulators.map(async (acc) => {
        const roles = await resolveMuscleRoles(
          acc.exerciseId,
          acc.exerciseName,
          this.fetchExerciseMetadata,
        );

        const averageIntensity =
          acc.rpeValues.length > 0
            ? acc.rpeValues.reduce((sum, v) => sum + v, 0) /
              acc.rpeValues.length
            : null;

        return {
          exerciseId: acc.exerciseId,
          exerciseName: acc.exerciseName,
          totalVolume: acc.totalVolume,
          completedSets: acc.completedSets,
          averageIntensity,
          lastPerformedAt: acc.lastPerformedAt ?? new Date(0),
          primaryMuscles: roles.primary,
          secondaryMuscles: roles.secondary,
          stabilizerMuscles: roles.stabilizer,
          sessionIds: Array.from(acc.sessionIds),
        } satisfies ExerciseWorkload;
      }),
    );
  }

  /**
   * Aggregates the weighted workload attributed to each muscle group,
   * using Feature 2.2's contribution weights. Weights default to the
   * roadmap values but can be overridden per call or via `config`.
   */
  async getMuscleContributions(
    userId: string,
    options: FatigueOptions = {},
  ): Promise<MuscleContributionTotal[]> {
    const exercises = await this.getExerciseWorkloads(userId, options);
    if (exercises.length === 0) return [];

    const weights = {
      ...this.calculator.getConfig().contributions,
      ...(options.config?.contributions ?? {}),
      ...(options.contributionWeights ?? {}),
    };
    const contributionCalculator = new MuscleContributionCalculator(weights);

    return contributionCalculator.aggregate(
      exercises.map((exercise) => ({
        totalVolume: exercise.totalVolume,
        completedSets: exercise.completedSets,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        stabilizerMuscles: exercise.stabilizerMuscles,
      })),
    );
  }

  /** Returns a fatigue score for every muscle group that was trained. */
  async getMuscleFatigue(
    userId: string,
    options: FatigueOptions = {},
  ): Promise<MuscleFatigue[]> {
    const now = options.now ?? new Date();
    const exercises = await this.getExerciseWorkloads(userId, options);

    const calculator = options.config
      ? new FatigueCalculator(options.config)
      : this.calculator;

    return calculator.calculateMuscleFatigue(exercises, now);
  }
}

export const fatigueService = new FatigueService();
