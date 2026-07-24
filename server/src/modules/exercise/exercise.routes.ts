import { Router } from "express";

import * as exerciseController from "./exercise.controller";

const router = Router();

router.get("/", exerciseController.getExercises);

router.get("/search", exerciseController.searchExercises);

router.get("/body-part", exerciseController.getExercisesByBodyPart);

router.get("/muscles", exerciseController.getExercisesByMuscles);

router.get("/equipments", exerciseController.getExercisesByEquipments);

router.get("/:id", exerciseController.getExerciseById);

export default router;
