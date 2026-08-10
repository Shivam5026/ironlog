import { z } from "zod";

export const workoutSummarySessionIdSchema = z.object({
  sessionId: z.string(),
});