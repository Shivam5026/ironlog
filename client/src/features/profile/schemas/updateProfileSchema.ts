import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters."),

  height: z
    .number()
    .positive("Height must be greater than 0.")
    .max(300, "Height seems unrealistic.")
    .nullable(),

  weight: z
    .number()
    .positive("Weight must be greater than 0.")
    .max(500, "Weight seems unrealistic.")
    .nullable(),

  goal: z
    .enum([
      "LOSE_WEIGHT",
      "MAINTAIN",
      "GAIN_MUSCLE",
      "STRENGTH",
      "ENDURANCE",
    ])
    .nullable(),

  experience: z
    .enum([
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
    ])
    .nullable(),
});

export type UpdateProfileFormValues = z.infer<
  typeof updateProfileSchema
>;