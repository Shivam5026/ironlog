import { z } from "zod";

const weightSchema = z
  .number()
  .positive("Weight must be greater than 0")
  .max(9999.99, "Weight is too large");

const recordedAtSchema = z.coerce.date();

export const createBodyWeightSchema = z.object({
  weight: weightSchema,
  recordedAt: recordedAtSchema.optional(),
});

export const updateBodyWeightSchema = z.object({
  weight: weightSchema,
  recordedAt: recordedAtSchema.optional(),
});

export const bodyWeightIdSchema = z.object({
  id: z.string().trim().min(1),
});

export const bodyWeightHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(365).optional(),
});
