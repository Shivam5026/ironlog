import { Router } from "express";

import { requireAuth } from "../../middlewares/requireAuth";
import { progressPhotoController } from "./progress-photo.controller";
import { uploadProgressPhoto } from "./middleware/upload.middleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  uploadProgressPhoto,
  progressPhotoController.createProgressPhoto,
);

router.get("/", progressPhotoController.getProgressPhotos);

router.delete("/:id", progressPhotoController.deleteProgressPhoto);

export default router;
