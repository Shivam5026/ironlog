import { Router } from "express";
import { requireAuth } from "../../../middlewares/requireAuth";
import { personalRecordController } from "../controllers/personal-record.controller";

const router = Router();

router.use(requireAuth);

router.get("/", personalRecordController.getPersonalRecords);
router.get("/:exerciseId", personalRecordController.getPersonalRecord);

export default router;
