import { z } from "zod";

export const workoutHistoryQuerySchema = z.object({
  cursor: z.string().trim().min(1).max(512).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["newest", "oldest", "volume", "duration"]).default("newest"),
});

export type WorkoutHistoryQuery = z.infer<
  typeof workoutHistoryQuerySchema
>;

export const workoutHistoryParamsSchema = z.object({
  id: z.string().trim().min(1),
});