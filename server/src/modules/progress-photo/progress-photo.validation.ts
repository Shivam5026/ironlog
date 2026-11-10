import { z } from "zod";

const weightSchema = z
  .coerce.number()
  .positive("Weight must be greater than 0")
  .max(9999.99, "Weight is too large");

export const createProgressPhotoSchema = z.object({
  category: z.enum(["FRONT", "BACK", "LEFT_SIDE", "RIGHT_SIDE", "CUSTOM"]),
  weight: weightSchema.optional(),
  notes: z.string().trim().max(2000).optional(),
  recordedAt: z.coerce.date().optional(),
});

export type CreateProgressPhotoInput = z.infer<
  typeof createProgressPhotoSchema
>;

export const progressPhotoIdSchema = z.object({
  id: z.string().trim().min(1),
});

/**
 * Pagination is optional: without `limit`/`offset` the endpoint returns the
 * user's full timeline, which keeps the frontend's year/month/day grouping
 * correct. Callers can opt into paging for very large histories.
 */
export const progressPhotoListQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
