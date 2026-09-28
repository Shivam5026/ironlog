import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { analyticsController } from "../controllers/analytics.controller";

const router = Router();

router.use(requireAuth);

router.get("/dashboard", analyticsController.getDashboardAnalytics);
router.get("/statistics", analyticsController.getStatistics);
router.get("/volume/muscles", analyticsController.getMuscleGroupVolume);
router.get("/volume/exercises", analyticsController.getExerciseVolume);
router.get("/volume", analyticsController.getVolumeAnalytics);
router.get("/trends/exercises", analyticsController.getExerciseProgressMetrics);
router.get("/trends", analyticsController.getProgressTrends);
router.get("/frequency", analyticsController.getWorkoutFrequency);
router.get("/exercise-distribution", analyticsController.getExerciseDistribution);
router.get("/muscle-distribution", analyticsController.getMuscleDistribution);
router.get("/progressive-overload", analyticsController.getVolumeComparison);
router.get("/progressive-overload/detection", analyticsController.getOverloadDetection);
router.get("/progressive-overload/plateaus", analyticsController.getPlateauDetection);
router.get("/muscles", analyticsController.getMuscleFrequency);
router.get("/consistency", analyticsController.getConsistencyFrequency);

export default router;
