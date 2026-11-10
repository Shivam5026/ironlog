import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as recoveryController from "../controllers/recovery.controller";

/**
 * Session crash-recovery routes.
 *
 * Mounted at /api/recovery/session so muscle-recovery owns GET /api/recovery.
 * Paths here are /active, /:sessionId — clients must include the /session prefix.
 */
const router = Router();

router.use(requireAuth);

router.get("/active", recoveryController.getActiveSession);
router.post("/:sessionId", recoveryController.recoverSession);
router.delete("/:sessionId", recoveryController.clearRecoveredSession);

export default router;
