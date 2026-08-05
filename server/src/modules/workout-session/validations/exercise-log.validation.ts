import { z } from "zod";

const setTypeSchema = z.enum(["WARMUP", "WORKING", "FAILURE"]);

const exerciseLogSetSchema = z.object({
  id: z.string().optional(),
  setNumber: z.coerce.number().int().min(1),
  weight: z.coerce.number().min(0),
  reps: z.coerce.number().int().min(0),
  restTime: z.coerce.number().int().min(0).optional(),
  setType: setTypeSchema.optional(),
  isWarmup: z.boolean().optional(),
  isFailure: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const createExerciseLogSchema = z.object({
  workoutSessionId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string().trim().min(1),
  exerciseOrder: z.coerce.number().int().min(0).optional(),
  notes: z.string().trim().max(500).optional(),
  sets: z.array(exerciseLogSetSchema).min(1),
});

export const updateExerciseLogSchema = z.object({
  notes: z.string().trim().max(500).nullable().optional(),
  sets: z.array(exerciseLogSetSchema).min(1).optional(),
});

export const exerciseLogParamsSchema = z.object({
  id: z.string(),
});
