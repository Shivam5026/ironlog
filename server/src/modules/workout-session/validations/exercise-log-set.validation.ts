import { z } from "zod";

export const createExerciseLogSetSchema = z.object({
  exerciseLogId: z.string(),
  weight: z.coerce.number().min(0),
  reps: z.coerce.number().int().min(0),
  setNumber: z.coerce.number().int().min(1),
  restTime: z.coerce.number().int().min(0).optional(),
  setType: z.enum(["WARMUP", "WORKING", "FAILURE"]).optional(),
});

export const updateExerciseLogSetSchema = z.object({
  weight: z.coerce.number().min(0).optional(),
  reps: z.coerce.number().int().min(0).optional(),
  setNumber: z.coerce.number().int().min(1).optional(),
  restTime: z.coerce.number().int().min(0).optional(),
  setType: z.enum(["WARMUP", "WORKING", "FAILURE"]).optional(),
  isWarmup: z.boolean().optional(),
  isFailure: z.boolean().optional(),
});

export const completeExerciseLogSetSchema = z.object({
  completed: z.boolean().default(true),
});

export const reorderExerciseLogSetSchema = z.object({
  exerciseLogId: z.string(),
  orderedIds: z.array(z.string()).min(1),
});

export const exerciseLogSetParamsSchema = z.object({
  id: z.string(),
});
