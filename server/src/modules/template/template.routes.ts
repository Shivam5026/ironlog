import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import * as templateController from "./template.controller";

const router = Router();

router.use(requireAuth);

router.get("/", templateController.getTemplates);
router.post("/", templateController.createTemplate);
router.put("/:templateId", templateController.updateTemplate);
router.delete("/:templateId", templateController.deleteTemplate);
router.post("/:templateId/use", templateController.useTemplate);

export default router;
