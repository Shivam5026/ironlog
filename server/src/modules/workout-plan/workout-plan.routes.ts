import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import * as workoutPlanController from "./workout-plan.controller";

const router = Router();

router.use(requireAuth);

router.get("/", workoutPlanController.getPlans);
router.post("/", workoutPlanController.createPlan);

router.get("/:id", workoutPlanController.getPlanById);
router.patch("/:id", workoutPlanController.updatePlan);
router.delete("/:id", workoutPlanController.deletePlan);

router.post("/:id/days", workoutPlanController.addDay);
router.delete("/:id/days/:dayId", workoutPlanController.removeDay);

router.post("/days/:dayId/exercises", workoutPlanController.addExercise);
router.delete("/exercises/:exerciseId", workoutPlanController.removeExercise);

export default router;
