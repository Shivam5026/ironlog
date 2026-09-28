import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { reportsController } from "../controllers/reports.controller";

const router = Router();

router.use(requireAuth);

// Report endpoints
router.get("/weekly", reportsController.getWeeklyReport);
router.get("/monthly", reportsController.getMonthlyReport);

// Export endpoints (Feature 7.3 — future-ready)
router.get("/weekly/export", reportsController.exportWeekly);
router.get("/monthly/export", reportsController.exportMonthly);

export default router;
