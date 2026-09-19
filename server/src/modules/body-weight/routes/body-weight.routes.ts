import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { bodyWeightController } from "../controllers/body-weight.controller";

const router = Router();

router.use(requireAuth);

router.get("/", bodyWeightController.getBodyWeightHistory);
router.post("/", bodyWeightController.createBodyWeight);
router.put("/:id", bodyWeightController.updateBodyWeight);
router.delete("/:id", bodyWeightController.deleteBodyWeight);

export default router;
