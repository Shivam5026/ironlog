import { Router } from "express";

import * as exerciseController from "./exercise.controller";

const router = Router();

router.get("/", exerciseController.getExercises);

export default router;