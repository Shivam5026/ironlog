import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import * as workoutDayController from "./workout-day.controller";

const router = Router();

router.use(requireAuth);

router.get("/", workoutDayController.getWorkoutDays);
router.post("/", workoutDayController.createWorkoutDay);
router.put("/reorder", workoutDayController.reorderWorkoutDays);

router.get("/:id", workoutDayController.getWorkoutDay);
router.put("/:id", workoutDayController.updateWorkoutDay);
router.delete("/:id", workoutDayController.deleteWorkoutDay);

export default router;
