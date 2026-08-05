import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as workoutSessionController from "../controllers/workout-session.controller";

const router = Router();

router.use(requireAuth);

router.post("/start", workoutSessionController.startWorkout);
router.get("/:id", workoutSessionController.getWorkoutSession);
router.put("/:id/pause", workoutSessionController.pauseWorkout);
router.put("/:id/resume", workoutSessionController.resumeWorkout);
router.post("/:id/finish", workoutSessionController.finishWorkout);

export default router;
