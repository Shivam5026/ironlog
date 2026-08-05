import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as performanceController from "../controllers/performance.controller";

const router = Router();

router.use(requireAuth);

router.get("/exercise/:exerciseId", performanceController.getPreviousPerformance);
router.get("/history/:exerciseId", performanceController.getExerciseHistory);
router.get("/personal-records", performanceController.getPersonalRecords);

export default router;
