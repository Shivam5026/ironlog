import { z } from "zod";

export const personalRecordParamsSchema = z.object({
  exerciseId: z.string().trim().min(1),
});
