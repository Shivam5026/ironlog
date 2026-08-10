import { z } from "zod";

export const historyQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  exercise: z.string().min(1).max(100).optional(),
  plan: z.string().min(1).max(100).optional(),
});

export const historyParamsSchema = z.object({
  sessionId: z.string().min(1),
});
