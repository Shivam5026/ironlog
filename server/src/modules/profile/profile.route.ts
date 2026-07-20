import { Router } from "express";

import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";

import { updateProfileSchema } from "./profile.schemas";
import { profileService } from "./profile.service";
import { ApiResponse } from "../../utils/ApiResponse";

const router = Router();

router.use(requireAuth);

/**
 * GET /api/profile
 */
router.get("/", async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);

    res.status(200).json(new ApiResponse(200, profile, "Profile fetched successfully"));
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/profile
 */
router.patch(
  "/",
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const profile = await profileService.updateProfile(
        req.user.id,
        req.body
      );

      res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"));
    } catch (error) {
      next(error);
    }
  }
);

export default router;