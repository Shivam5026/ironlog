import { z } from "zod";

export const exerciseIdParamsSchema = z.object({
  exerciseId: z.string(),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});