import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters.")
    .optional(),

  height: z
    .number()
    .positive("Height must be greater than 0.")
    .max(300, "Height seems unrealistic.")
    .optional(),

  weight: z
    .number()
    .positive("Weight must be greater than 0.")
    .max(500, "Weight seems unrealistic.")
    .optional(),

  goal: z
    .enum([
      "LOSE_WEIGHT",
      "MAINTAIN",
      "GAIN_MUSCLE",
      "STRENGTH",
      "ENDURANCE",
    ])
    .optional(),

  experience: z
    .enum([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ])
    .optional(),
});