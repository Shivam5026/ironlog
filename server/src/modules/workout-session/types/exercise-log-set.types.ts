import type { z } from "zod";
import type {
  createExerciseLogSetSchema,
  updateExerciseLogSetSchema,
  completeExerciseLogSetSchema,
  reorderExerciseLogSetSchema,
} from "../validations/exercise-log-set.validation";

export type CreateExerciseLogSetInput = z.infer<typeof createExerciseLogSetSchema>;
export type UpdateExerciseLogSetInput = z.infer<typeof updateExerciseLogSetSchema>;
export type CompleteExerciseLogSetInput = z.infer<typeof completeExerciseLogSetSchema>;
export type ReorderExerciseLogSetInput = z.infer<typeof reorderExerciseLogSetSchema>;
