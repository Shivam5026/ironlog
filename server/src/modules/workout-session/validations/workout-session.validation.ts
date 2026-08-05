import { z } from "zod";

export const startWorkoutSchema = z.object({
  workoutPlanId: z.string(),
});

export const sessionIdSchema = z.object({
  id: z.string(),
});
