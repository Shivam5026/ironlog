import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { streakController } from "../controllers/streak.controller";

const router = Router();

router.use(requireAuth);

router.get("/", streakController.getStreak);

export default router;
