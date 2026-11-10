import { prisma } from "../../../config/prisma";
import { withCache } from "../../../lib/cache";
import { getExerciseById, getExercises } from "../../exercise/exerciseDb.service";
import type { Exercise } from "../../exercise/exercise.types";
import { AnalyticsRepository } from "../../analytics/repositories/analytics.repository";
import {
  classifyExercise,
  mapMuscleNamesToGroups,
  MUSCLE_GROUPS,
  type MuscleGroup,
} from "../../analytics/lib/muscleClassification";
import { workoutPlanService } from "../../workout-plan/workout-plan.service";
import type {
  ExerciseCandidate,
  ExerciseRecommendationOptions,
  ExerciseRecommendationsResponse,
} from "../types/recovery.types";
import {
  ExerciseRecommendationCalculator,
} from "../utils/exercise-recommendation.calculator";
import { RecommendationService } from "./recommendation.service";
import { RecoveryService } from "./recovery.service";

const MS_PER_DAY = 86_400_000;
const CACHE_TTL = 60 * 60 * 24; // 24 hours

/** Representative ExerciseDB target-muscle name used per muscle group. */
const EXERCISE_DB_TARGET_MUSCLE_BY_GROUP: Record<MuscleGroup, string> = {
  Chest: "pectorals",
  Back: "lats",
  Legs: "quadriceps",
  Shoulders: "deltoids",
  Biceps: "biceps",
  Triceps: "triceps",
  Forearms: "forearms",
  Core: "abdominals",
  Glutes: "glutes",
  Hamstrings: "hamstrings",
  Calves: "calves",
};

/** Exercise record metadata the recommendation service needs. */
export interface ExerciseRecordFetcher {
  (exerciseId: string): Promise<{
    targetMuscles?: string[];
    secondaryMuscles?: string[];
    bodyParts?: string[];
    equipments?: string[];
  }>;
}

/** A reference to an exercise in the user's library (plans + recent logs). */
export interface ExerciseLibraryRef {
  exerciseId: string;
  exerciseName: string;
}

/** Default: cache full ExerciseDB records so recommenders never hammer the API. */
export const cachedExerciseRecordFetcher: ExerciseRecordFetcher = (
  exerciseId: string,
) =>
  withCache(
    `exercise:record:${exerciseId}`,
    async () => {
      const exercise = await getExerciseById(exerciseId);
      return exercise;
    },
    CACHE_TTL,
  );

function toExerciseCandidate(
  exerciseId: string,
  exerciseName: string,
  meta: Awaited<ReturnType<ExerciseRecordFetcher>>,
): ExerciseCandidate {
  const targetGroups = mapMuscleNamesToGroups(meta.targetMuscles ?? []);
  const secondaryGroups = mapMuscleNamesToGroups(
    meta.secondaryMuscles ?? [],
  ).filter((group) => !targetGroups.includes(group));

  if (targetGroups.length === 0) {
    const fallback = classifyExercise(
      { targetMuscles: meta.targetMuscles ?? [], bodyParts: meta.bodyParts ?? [] },
      exerciseName,
    );
    return {
      exerciseId,
      exerciseName: exerciseName || exerciseId,
      targetMuscles: Array.from(fallback),
      secondaryMuscles: secondaryGroups,
      equipments: meta.equipments ?? [],
    };
  }

  return {
    exerciseId,
    exerciseName: exerciseName || exerciseId,
    targetMuscles: targetGroups,
    secondaryMuscles: secondaryGroups,
    equipments: meta.equipments ?? [],
  };
}

/**
 * Exercise Recommendation Service (Feature 5.2)
 *
 * Composes the existing engines — today's workout recommendation (5.1), the
 * Epic 3 recovery summary, the user's own exercise library (workout plans and
 * recent completed sessions) and the existing ExerciseDB search service — into
 * a daily exercise recommendation. All ranking math lives in the pure
 * ExerciseRecommendationCalculator; this class only gathers and shapes inputs.
 * Recovery and recommendation results are already cached upstream, and full
 * exercise records are cached for 24h, so no new database tables are needed.
 */
export interface ExerciseRecommendationServiceDependencies {
  recommendation?: RecommendationService;
  recovery?: RecoveryService;
  repository?: AnalyticsRepository;
  calculator?: ExerciseRecommendationCalculator;
  fetchExerciseRecord?: ExerciseRecordFetcher;
  /** Loads the user's exercises (plans + recent sessions). */
  loadLibraryExercises?: (
    userId: string,
    now: Date,
    libraryLookbackDays: number,
  ) => Promise<ExerciseLibraryRef[]>;
  /** Enriches the candidate pool from ExerciseDB search (empty-safe). */
  searchExercises?: (
    targetMuscles: MuscleGroup[],
    limit: number,
  ) => Promise<ExerciseCandidate[]>;
}

export class ExerciseRecommendationService {
  private readonly recommendation: RecommendationService;
  private readonly recovery: RecoveryService;
  private readonly repository: AnalyticsRepository;
  private readonly calculator: ExerciseRecommendationCalculator;
  private readonly fetchExerciseRecord: ExerciseRecordFetcher;
  private readonly loadLibraryExercises: (
    userId: string,
    now: Date,
    libraryLookbackDays: number,
  ) => Promise<ExerciseLibraryRef[]>;
  private readonly searchExercises: (
    targetMuscles: MuscleGroup[],
    limit: number,
  ) => Promise<ExerciseCandidate[]>;

  constructor(deps: ExerciseRecommendationServiceDependencies = {}) {
    this.recommendation = deps.recommendation ?? new RecommendationService();
    this.recovery = deps.recovery ?? new RecoveryService();
    this.repository = deps.repository ?? new AnalyticsRepository(prisma);
    this.calculator = deps.calculator ?? new ExerciseRecommendationCalculator();
    this.fetchExerciseRecord = deps.fetchExerciseRecord ?? cachedExerciseRecordFetcher;
    this.loadLibraryExercises = deps.loadLibraryExercises ?? this.loadLibraryFromHistory;
    this.searchExercises = deps.searchExercises ?? searchExercisesFromExerciseDb;
  }

  /**
   * The user's own exercise library: exercises in their workout plans, plus
   * exercises logged in recent completed sessions. Plans are cached upstream.
   */
  private async loadLibraryFromHistory(
    userId: string,
    now: Date,
    libraryLookbackDays: number,
  ): Promise<ExerciseLibraryRef[]> {
    const seen = new Map<string, string>();
    const add = (exerciseId: string, exerciseName: string) => {
      if (!exerciseId) return;
      if (!seen.has(exerciseId)) seen.set(exerciseId, exerciseName || exerciseId);
    };

    try {
      const plans = await workoutPlanService.getPlans(userId);
      for (const plan of plans) {
        for (const day of plan.workoutDays) {
          for (const exercise of day.exercises) {
            add(exercise.exerciseId, exercise.exerciseName);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load exercise library from plans", error);
    }

    try {
      const sessions = await this.repository.getSessionsWithExercises(userId, {
        startDate: new Date(now.getTime() - libraryLookbackDays * MS_PER_DAY),
      });
      for (const session of sessions) {
        for (const log of session.exerciseLogs) {
          add(log.exerciseId, log.exerciseName);
        }
      }
    } catch (error) {
      console.error("Failed to load exercise library from sessions", error);
    }

    return Array.from(seen, ([exerciseId, exerciseName]) => ({
      exerciseId,
      exerciseName,
    }));
  }

  async getExerciseRecommendations(
    userId: string,
    options: ExerciseRecommendationOptions = {},
  ): Promise<ExerciseRecommendationsResponse> {
    const now = options.now ?? new Date();
    const calculator = options.config
      ? new ExerciseRecommendationCalculator(options.config)
      : this.calculator;
    const config = calculator.getConfig();

    const recommendation = await this.recommendation.getRecommendation(userId, {
      now,
    });

    const summary = await this.recovery.getRecoverySummary(userId, {
      now,
      fatigue: { config: { lookbackHours: config.recoveryLookbackDays * 24 } },
    });

    const muscleRecovery = Object.fromEntries(
      MUSCLE_GROUPS.map((muscle) => {
        const entry = summary.muscles.find(
          (m) => m.muscle === muscle && m.lastTrainedAt !== null,
        );
        return [muscle, entry ? entry.recoveryPercentage : 100];
      }),
    ) as Record<MuscleGroup, number>;

    const groupSet = new Set<string>(MUSCLE_GROUPS);
    const recommendedTargetMuscles = recommendation.targetMuscles.filter(
      (muscle): muscle is MuscleGroup => groupSet.has(muscle),
    );

    const candidates = new Map<string, ExerciseCandidate>();

    // 1. The user's own exercise library.
    const library = await this.loadLibraryExercises(
      userId,
      now,
      config.libraryLookbackDays,
    );
    for (const ref of library) {
      try {
        const meta = await this.fetchExerciseRecord(ref.exerciseId);
        const candidate = toExerciseCandidate(ref.exerciseId, ref.exerciseName, meta);
        if (candidate.exerciseId) candidates.set(candidate.exerciseId, candidate);
      } catch (error) {
        // A single unresolvable exercise must not break the whole response.
        console.error(`Failed to resolve exercise ${ref.exerciseId}`, error);
      }
    }

    // 2. ExerciseDB enrichment for alternatives targeting today's focus.
    if (config.enrichmentLimitPerMuscle > 0 && recommendedTargetMuscles.length > 0) {
      const enriched = await this.searchExercises(
        recommendedTargetMuscles,
        config.enrichmentLimitPerMuscle,
      );
      for (const candidate of enriched) {
        if (!candidates.has(candidate.exerciseId)) {
          candidates.set(candidate.exerciseId, candidate);
        }
      }
    }

    return calculator.calculate(
      {
        recommendedTargetMuscles,
        recommendationTitle: recommendation.title,
        muscleRecovery,
        candidates: Array.from(candidates.values()),
        availableEquipment: options.availableEquipment ?? [],
      },
      now,
    );
  }
}

/**
 * Reuses the existing ExerciseDB search endpoint to find exercises targeting
 * today's focus muscles (raw ExerciseDB muscle names per group). Any external
 * failure degrades to an empty enrichment, matching the "safe on missing
 * metadata" requirement.
 */
async function searchExercisesFromExerciseDb(
  targetMuscles: MuscleGroup[],
  limit: number,
): Promise<ExerciseCandidate[]> {
  const candidates = new Map<string, ExerciseCandidate>();
  for (const group of targetMuscles) {
    const rawMuscle = EXERCISE_DB_TARGET_MUSCLE_BY_GROUP[group];
    if (!rawMuscle) continue;
    try {
      const exercises = await getExercises({
        targetMuscles: rawMuscle,
        limit,
      });
      for (const exercise of exercises as Exercise[]) {
        const candidate = toExerciseCandidate(
          exercise.exerciseId,
          exercise.name,
          {
            targetMuscles: exercise.targetMuscles,
            secondaryMuscles: exercise.secondaryMuscles,
            bodyParts: exercise.bodyParts,
            equipments: exercise.equipments,
          },
        );
        if (!candidates.has(candidate.exerciseId)) {
          candidates.set(candidate.exerciseId, candidate);
        }
      }
    } catch (error) {
      console.error(`ExerciseDB enrichment failed for ${group}`, error);
    }
  }
  return Array.from(candidates.values());
}

export const exerciseRecommendationService = new ExerciseRecommendationService();