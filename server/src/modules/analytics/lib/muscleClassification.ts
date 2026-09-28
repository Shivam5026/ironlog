import { withCache } from "../../../lib/cache";
import { getExerciseById } from "../../exercise/exerciseDb.service";

const CACHE_TTL = 60 * 60 * 24; // 24 hours

// ── Muscle Group Categories ───────────────────────────────────────

export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
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
  hamstrings: "Legs",
  glutes: "Legs",
  calves: "Legs",
  "upper legs": "Legs",
  "lower legs": "Legs",
  hip: "Legs",
  "hip flexors": "Legs",
  adductors: "Legs",
  abductors: "Legs",

  // Shoulders
  deltoids: "Shoulders",
  shoulders: "Shoulders",
  rotator: "Shoulders",

  // Arms
  biceps: "Arms",
  triceps: "Arms",
  forearms: "Arms",
  "upper arms": "Arms",
  brachialis: "Arms",
  brachioradialis: "Arms",

  // Core
  abdominals: "Core",
  abs: "Core",
  obliques: "Core",
  waist: "Core",
  "serratus anterior": "Core",
};

function mapMuscleToGroup(muscle: string): MuscleGroup | null {
  const normalized = muscle.toLowerCase().trim();
  return MUSCLE_TO_GROUP[normalized] ?? null;
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
  "leg curl": "Legs",
  "hamstring curl": "Legs",
  lunge: "Legs",
  lunges: "Legs",
  "bulgarian split": "Legs",
  "romanian deadlift": "Legs",
  rdl: "Legs",
  hip: "Legs",
  "hip thrust": "Legs",
  "hip extension": "Legs",
  calf: "Legs",
  "calf raise": "Legs",
  "leg raise": "Legs",

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

  // Arms
  curl: "Arms",
  "bicep curl": "Arms",
  "hammer curl": "Arms",
  "preacher curl": "Arms",
  "tricep pushdown": "Arms",
  "tricep extension": "Arms",
  "skull crusher": "Arms",
  "close grip": "Arms",
  "tricep dip": "Arms",
  "forearm curl": "Arms",
  "wrist curl": "Arms",

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
