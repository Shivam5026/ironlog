import type { z } from "zod";
import type {
  createExerciseLogSchema,
  updateExerciseLogSchema,
} from "../validations/exercise-log.validation";

export type CreateExerciseLogInput = z.infer<typeof createExerciseLogSchema>;
export type UpdateExerciseLogInput = z.infer<typeof updateExerciseLogSchema>;
