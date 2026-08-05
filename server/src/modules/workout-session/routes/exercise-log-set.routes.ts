import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as exerciseLogSetController from "../controllers/exercise-log-set.controller";

const router = Router();

router.use(requireAuth);

router.post("/", exerciseLogSetController.createExerciseLogSet);
router.patch("/reorder", exerciseLogSetController.reorderExerciseLogSets);
router.patch("/:id", exerciseLogSetController.updateExerciseLogSet);
router.patch("/:id/complete", exerciseLogSetController.completeExerciseLogSet);
router.delete("/:id", exerciseLogSetController.deleteExerciseLogSet);

export default router;
