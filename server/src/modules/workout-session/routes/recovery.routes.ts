import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as recoveryController from "../controllers/recovery.controller";

const router = Router();

router.use(requireAuth);

router.get("/active", recoveryController.getActiveSession);
router.post("/:sessionId", recoveryController.recoverSession);
router.delete("/:sessionId", recoveryController.clearRecoveredSession);

export default router;
