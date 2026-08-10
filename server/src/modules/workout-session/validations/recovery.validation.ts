import { z } from "zod";

export const recoverySessionIdSchema = z.object({
  sessionId: z.string(),
});
