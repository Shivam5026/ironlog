import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

router.use(requireAuth);

router.get("/statistics", analyticsController.getStatistics);
router.get("/volume", analyticsController.getVolumeAnalytics);
router.get("/frequency", analyticsController.getWorkoutFrequency);
router.get("/exercise-distribution", analyticsController.getExerciseDistribution);
router.get("/muscle-distribution", analyticsController.getMuscleDistribution);

export default router;
