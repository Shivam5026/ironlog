import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as workoutSummaryController from "../controllers/workout-summary.controller";

const router = Router();

router.use(requireAuth);

router.get("/:sessionId/summary", workoutSummaryController.getWorkoutSummary);
router.post("/:sessionId/complete", workoutSummaryController.completeWorkout);

export default router;