import { z } from "zod";

export const createWorkoutDaySchema = z.object({
  workoutPlanId: z.string().min(1),
  name: z.string().trim().min(3).max(50),
});

export const updateWorkoutDaySchema = z.object({
  name: z.string().trim().min(3).max(50),
});

export const workoutDayIdSchema = z.object({
  id: z.string().min(1),
});

export const reorderWorkoutDaysSchema = z.object({
  workoutPlanId: z.string().min(1),
  days: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
    }),
  ),
});
