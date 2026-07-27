import { Router } from "express";

import * as exerciseController from "./exercise.controller";

const router = Router();

router.get("/", exerciseController.getExercises);

router.get("/body-parts", exerciseController.getBodyParts);

router.get("/target-muscles", exerciseController.getTargetMuscles);

router.get("/equipments", exerciseController.getEquipments);

router.get("/:id", exerciseController.getExerciseById);

export default router;
