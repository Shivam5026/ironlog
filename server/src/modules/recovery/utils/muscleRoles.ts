import { withCache } from "../../../lib/cache";
import { getExerciseById } from "../../exercise/exerciseDb.service";
import {
  classifyExercise,
  mapMuscleNamesToGroups,
  type MuscleGroup,
} from "../../analytics/lib/muscleClassification";
import type { MuscleRoleAssignment } from "../types/recovery.types";

/**
 * Exercise → muscle role resolution.
 *
 * Roles come from exercise metadata, never from a hardcoded table in the
 * recovery service:
 *   primary    ← targetMuscles
 *   secondary  ← secondaryMuscles
 *   stabilizer ← bodyParts (excluding anything already primary/secondary)
 *
 * Accepts an optional fetcher so callers (and tests) can supply exercise
 * metadata without reaching the network.
 */

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export type ExerciseMetadataFetcher = (exerciseId: string) => Promise<{
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  bodyParts?: string[];
}>;

export async function resolveMuscleRoles(
  exerciseId: string,
  exerciseName: string,
  fetcher: ExerciseMetadataFetcher = getExerciseById,
): Promise<MuscleRoleAssignment> {
  return withCache(
    `recovery:roles:${exerciseId}`,
    async (): Promise<MuscleRoleAssignment> => {
      let targetMuscles: string[] = [];
      let secondaryMuscles: string[] = [];
      let bodyParts: string[] = [];

      try {
        const exercise = await fetcher(exerciseId);
        targetMuscles = exercise.targetMuscles ?? [];
        secondaryMuscles = exercise.secondaryMuscles ?? [];
        bodyParts = exercise.bodyParts ?? [];
      } catch {
        // Metadata unavailable — fall through to name-based classification.
      }

      const primary = mapMuscleNamesToGroups(targetMuscles);
      const secondary = mapMuscleNamesToGroups(secondaryMuscles).filter(
        (g) => !primary.includes(g),
      );
      const stabilizer = mapMuscleNamesToGroups(bodyParts).filter(
        (g) => !primary.includes(g) && !secondary.includes(g),
      );

      if (primary.length > 0 || secondary.length > 0) {
        return { primary, secondary, stabilizer };
      }

      // No usable metadata — fall back to name-based classification as primary.
      const fallback = classifyExercise(
        { targetMuscles: [], bodyParts: [] },
        exerciseName,
      );
      return { primary: Array.from(fallback), secondary: [], stabilizer: [] };
    },
    CACHE_TTL,
  );
}
