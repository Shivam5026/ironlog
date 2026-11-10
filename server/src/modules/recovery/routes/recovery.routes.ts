import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as recoveryController from "../controllers/recovery.controller";

const router = Router();

router.use(requireAuth);

router.get("/", recoveryController.getRecoverySummary);
router.get("/readiness", recoveryController.getReadiness);
router.get("/recommendations", recoveryController.getTodayRecommendation);
router.get("/recommendations/exercises", recoveryController.getExerciseRecommendations);
router.get("/overtraining", recoveryController.getOvertraining);
router.get("/timeline", recoveryController.getRecoveryTimeline);
router.get("/analytics/trends", recoveryController.getRecoveryTrends);
router.get("/analytics/reports", recoveryController.getRecoveryReports);

export default router;
