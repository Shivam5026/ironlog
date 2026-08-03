import { z } from "zod";

export const createWorkoutExerciseSchema = z.object({
  workoutDayId: z.string().min(1),
  exerciseId: z.string().min(1),
  exerciseName: z.string().trim().min(1).max(200),
  gifUrl: z.string().url().optional().nullable(),
  sets: z.coerce.number().int().min(1).max(50).default(3),
  reps: z.coerce.number().int().min(1).max(100).default(10),
  restTime: z.coerce.number().int().min(0).max(600).default(90),
  notes: z.string().trim().max(500).optional(),
});

export const updateWorkoutExerciseSchema = createWorkoutExerciseSchema
  .pick({ sets: true, reps: true, restTime: true, notes: true })
  .partial()
  .extend({
    sets: z.coerce.number().int().min(1).max(20).optional(),
  });

export const workoutExerciseIdSchema = z.object({
  id: z.string().min(1),
});

export const reorderWorkoutExercisesSchema = z.object({
  workoutDayId: z.string().min(1),
  exercises: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
    }),
  ),
});

export const replaceWorkoutExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().trim().min(1).max(200),
  gifUrl: z.string().url().optional().nullable(),
});
