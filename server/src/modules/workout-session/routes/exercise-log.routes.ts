import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as exerciseLogController from "../controllers/exercise-log.controller";

const router = Router();

router.use(requireAuth);

router.post("/", exerciseLogController.createExerciseLog);
router.get("/:id", exerciseLogController.getExerciseLog);
router.put("/:id", exerciseLogController.updateExerciseLog);
router.delete("/:id", exerciseLogController.deleteExerciseLog);

export default router;
