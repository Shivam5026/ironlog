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

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type CreateDayInput = z.infer<typeof createDaySchema>;
