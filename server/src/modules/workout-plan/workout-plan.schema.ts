import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

export const updatePlanSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
});

export const planIdSchema = z.object({
  id: z.string(),
});

export const createDaySchema = z.object({
  name: z.string().trim().min(1).max(100),
  order: z.coerce.number().int().min(0),
});

export const dayIdSchema = z.object({
  dayId: z.string(),
});

export const addExerciseSchema = z.object({
  exerciseId: z.string(),
  order: z.coerce.number().int().min(0),
  sets: z.coerce.number().int().min(1).max(50).default(3),
  reps: z.coerce.number().int().min(1).max(100).default(10),
  restTime: z.coerce.number().int().min(0).max(600).default(90),
  notes: z.string().trim().max(500).optional(),
});

export const exerciseIdSchema = z.object({
  exerciseId: z.string(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateDayInput = z.infer<typeof createDaySchema>;
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;
