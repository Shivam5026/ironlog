import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import * as workoutExerciseController from "./workout-exercise.controller";

const router = Router();

router.use(requireAuth);

router.get("/", workoutExerciseController.getWorkoutExercises);
router.post("/", workoutExerciseController.createWorkoutExercise);
router.put("/reorder", workoutExerciseController.reorderWorkoutExercises);

router.get("/:id", workoutExerciseController.getWorkoutExercise);
router.put("/:id", workoutExerciseController.updateWorkoutExercise);
router.put("/:id/replace", workoutExerciseController.replaceWorkoutExercise);
router.delete("/:id", workoutExerciseController.deleteWorkoutExercise);

export default router;
