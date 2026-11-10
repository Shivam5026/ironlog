import { withCache } from "../../../lib/cache";
import { getExerciseById } from "../../exercise/exerciseDb.service";

const CACHE_TTL = 60 * 60 * 24; // 24 hours

// ── Muscle Group Categories ───────────────────────────────────────

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Core",
  "Glutes",
  "Hamstrings",
  "Calves",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

const MUSCLE_TO_GROUP: Record<string, MuscleGroup> = {
  // Chest
  pectorals: "Chest",
  chest: "Chest",

  // Back
  lats: "Back",
  "upper back": "Back",
  "middle back": "Back",
  "lower back": "Back",
  traps: "Back",
  rhomboids: "Back",

  // Legs
  quadriceps: "Legs",
  "upper legs": "Legs",
  hip: "Legs",
  "hip flexors": "Legs",
  adductors: "Legs",
  abductors: "Legs",

  // Shoulders
  deltoids: "Shoulders",
  shoulders: "Shoulders",
  rotator: "Shoulders",

  // Biceps
  biceps: "Biceps",
  brachialis: "Biceps",

  // Triceps
  triceps: "Triceps",

  // Forearms
  forearms: "Forearms",
  brachioradialis: "Forearms",

  // Core
  abdominals: "Core",
  abs: "Core",
  obliques: "Core",
  waist: "Core",
  "serratus anterior": "Core",

  // Glutes
  glutes: "Glutes",

  // Hamstrings
  hamstrings: "Hamstrings",

  // Calves
  calves: "Calves",
  "lower legs": "Calves",
};

function mapMuscleToGroup(muscle: string): MuscleGroup | null {
  const normalized = muscle.toLowerCase().trim();
  return MUSCLE_TO_GROUP[normalized] ?? null;
}

/**
 * Maps a list of raw muscle names (e.g. ["pectorals", "triceps"]) to the
 * distinct muscle groups they belong to. Unlike classifyExercise this
 * preserves which groups a specific muscle list maps to, so callers can
 * apply different treatment per list (e.g. primary vs secondary muscles).
 */
export function mapMuscleNamesToGroups(muscles: string[]): MuscleGroup[] {
  const groups = new Set<MuscleGroup>();
  for (const muscle of muscles) {
    const group = mapMuscleToGroup(muscle);
    if (group) groups.add(group);
  }
  return Array.from(groups);
}

// ── Name-based fallback classification ────────────────────────────

const NAME_TO_GROUP: Record<string, MuscleGroup> = {
  // Chest
  bench: "Chest",
  "bench press": "Chest",
  "dumbbell press": "Chest",
  "chest press": "Chest",
  fly: "Chest",
  "cable fly": "Chest",
  "chest fly": "Chest",
  incline: "Chest",
  "incline press": "Chest",
  "incline dumbbell": "Chest",
  "pec deck": "Chest",
  // Specific before generic so substring matching stays accurate.
  "tricep dip": "Triceps",
  dip: "Chest",
  dips: "Chest",

  // Back
  row: "Back",
  "barbell row": "Back",
  "dumbbell row": "Back",
  "cable row": "Back",
  "seated row": "Back",
  pulldown: "Back",
  "lat pulldown": "Back",
  "lat": "Back",
  pullup: "Back",
  "pull-up": "Back",
  "chin up": "Back",
  "chin-up": "Back",
  deadlift: "Back",
  "dead lift": "Back",
  "rack pull": "Back",
  shrug: "Back",
  "face pull": "Back",

  // Legs
  squat: "Legs",
  "barbell squat": "Legs",
  "front squat": "Legs",
  "goblet squat": "Legs",
  "leg press": "Legs",
  "leg extension": "Legs",
  lunge: "Legs",
  lunges: "Legs",
  "bulgarian split": "Legs",
  "leg raise": "Legs",
  // Specific before generic "hip" so substring matching stays accurate.
  "hip thrust": "Glutes",
  "hip extension": "Legs",
  hip: "Legs",

  // Shoulders
  overhead: "Shoulders",
  "overhead press": "Shoulders",
  ohp: "Shoulders",
  "military press": "Shoulders",
  "shoulder press": "Shoulders",
  "lateral raise": "Shoulders",
  "front raise": "Shoulders",
  "rear delt": "Shoulders",
  "arnold press": "Shoulders",
  upright: "Shoulders",
  "upright row": "Shoulders",

  // Hamstrings (specific "curl" family ordered before the generic key)
  "leg curl": "Hamstrings",
  "hamstring curl": "Hamstrings",
  "romanian deadlift": "Hamstrings",
  rdl: "Hamstrings",

  // Biceps
  "bicep curl": "Biceps",
  "hammer curl": "Biceps",
  "preacher curl": "Biceps",

  // Triceps
  "tricep pushdown": "Triceps",
  "tricep extension": "Triceps",
  "skull crusher": "Triceps",
  "close grip": "Triceps",

  // Forearms
  "forearm curl": "Forearms",
  "wrist curl": "Forearms",

  // Calves
  "calf raise": "Calves",
  calf: "Calves",

  // Core
  plank: "Core",
  crunch: "Core",
  "crunches": "Core",
  "sit up": "Core",
  "sit-up": "Core",
  "russian twist": "Core",
  "hanging leg": "Core",
  "ab rollout": "Core",
  "woodchop": "Core",
  "pallof press": "Core",

  // Generic curl (last so every specific "…curl" key matches first).
  curl: "Biceps",
};

function classifyByName(exerciseName: string): MuscleGroup | null {
  const lower = exerciseName.toLowerCase().trim();
  // Try exact match first, then substring match
  if (NAME_TO_GROUP[lower]) return NAME_TO_GROUP[lower];
  for (const [keyword, group] of Object.entries(NAME_TO_GROUP)) {
    if (lower.includes(keyword)) return group;
  }
  return null;
}

// ── Exercise Metadata Fetch ───────────────────────────────────────

export async function getExerciseMuscles(
  exerciseId: string,
): Promise<{ targetMuscles: string[]; bodyParts: string[] }> {
  return withCache(
    `exercise:muscles:${exerciseId}`,
    async () => {
      try {
        const exercise = await getExerciseById(exerciseId);
        return {
          targetMuscles: exercise.targetMuscles ?? [],
          bodyParts: exercise.bodyParts ?? [],
        };
      } catch {
        return { targetMuscles: [], bodyParts: [] };
      }
    },
    CACHE_TTL,
  );
}

// ── Classification ────────────────────────────────────────────────

export function classifyExercise(
  muscles: { targetMuscles: string[]; bodyParts: string[] },
  exerciseName?: string,
): Set<MuscleGroup> {
  const groups = new Set<MuscleGroup>();

  for (const muscle of muscles.targetMuscles) {
    const group = mapMuscleToGroup(muscle);
    if (group) groups.add(group);
  }

  if (groups.size === 0) {
    for (const part of muscles.bodyParts) {
      const group = mapMuscleToGroup(part);
      if (group) groups.add(group);
    }
  }

  // Fallback: classify by exercise name if metadata yielded nothing
  if (groups.size === 0 && exerciseName) {
    const group = classifyByName(exerciseName);
    if (group) groups.add(group);
  }

  return groups;
}
