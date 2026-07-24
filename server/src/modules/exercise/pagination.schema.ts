import { z } from "zod";

export const cursorPaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(25).optional(),
  after: z.string().trim().optional(),
  before: z.string().trim().optional(),
});

export type CursorPaginationQuery = z.infer<
  typeof cursorPaginationSchema
>;