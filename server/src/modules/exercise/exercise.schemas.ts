import { z } from "zod";
import { cursorPaginationSchema } from "./pagination.schema";

export const exerciseIdSchema = z.object({
  id: z.string(),
});

export type ExerciseParams = z.infer<typeof exerciseIdSchema>;

export const exerciseSearchSchema = z.object({
  search: z
    .string()
    .trim()
    .min(1)
    .max(100),

  threshold: z.coerce
    .number()
    .min(0)
    .max(1)
    .optional(),
});

export type ExerciseSearchQuery = z.infer<
  typeof exerciseSearchSchema
>;

export const bodyPartSchema = cursorPaginationSchema.extend({
  bodyParts: z.string().trim().min(1),
});

export type BodyPartQuery = z.infer<typeof bodyPartSchema>;

export const muscleSchema = cursorPaginationSchema.extend({
  targetMuscles: z.string().trim().min(1),
});

export type MusclesQuery = z.infer<typeof muscleSchema>;

export const equipmentSchema = cursorPaginationSchema.extend({
  equipments: z.string().trim().min(1),
});

export type EquipmentsQuery = z.infer<typeof equipmentSchema>;

export const exerciseFiltersSchema = z.object({
  search: z.string().trim().optional(),

  bodyParts: z.string().trim().optional(),

  targetMuscles: z.string().trim().optional(),

  equipments: z.string().trim().optional(),

  limit: z.coerce.number().int().min(1).max(25).default(20),

  after: z.string().optional(),

  before: z.string().optional(),
});

export type ExerciseFilters = z.infer<typeof exerciseFiltersSchema>;