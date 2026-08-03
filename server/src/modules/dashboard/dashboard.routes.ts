import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.use(requireAuth);

router.get("/stats", dashboardController.getStats);
router.get("/recent-plans", dashboardController.getRecentPlans);
router.get("/recent-templates", dashboardController.getRecentTemplates);

export default router;