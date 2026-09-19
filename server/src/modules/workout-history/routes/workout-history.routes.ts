import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { workoutHistoryController } from "../controllers/workout-history.controller";

const router = Router();

router.use(requireAuth);

router.get("/", workoutHistoryController.getWorkoutHistory);
router.get("/:id", workoutHistoryController.getWorkoutDetail);

export default router;