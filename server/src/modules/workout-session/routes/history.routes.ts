import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import * as historyController from "../controllers/history.controller";

const router = Router();

router.use(requireAuth);

router.get("/", historyController.getWorkoutHistory);
router.get("/:sessionId", historyController.getWorkoutDetails);
router.delete("/:sessionId", historyController.deleteWorkout);

export default router;
