import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  countProgressPhotos,
  createProgressPhoto,
  deleteProgressPhoto,
  getProgressPhotos,
} from "./progress-photo.service";
import {
  createProgressPhotoSchema,
  progressPhotoIdSchema,
  progressPhotoListQuerySchema,
} from "./progress-photo.validation";

async function createProgressPhotoController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Never trust a client-supplied user id: the authenticated session is the
    // only source of the owner for the photo.
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!req.file) {
      throw new ApiError(400, "Please upload a photo.");
    }

    const metadata = createProgressPhotoSchema.parse(req.body);

    const photo = await createProgressPhoto({
      userId,
      file: req.file,
      ...metadata,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, photo, "Progress photo uploaded successfully"));
  } catch (error) {
    next(error);
  }
}

async function getProgressPhotosController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { limit, offset } = progressPhotoListQuerySchema.parse(req.query);

    const [photos, total] = await Promise.all([
      getProgressPhotos(userId, { limit, offset }),
      countProgressPhotos(userId),
    ]);

    return res.status(200).json({
      ...new ApiResponse(200, photos, "Progress photos fetched"),
      total,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProgressPhotoController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = progressPhotoIdSchema.parse(req.params);

    const deleted = await deleteProgressPhoto(id, userId);

    if (!deleted) {
      throw new ApiError(404, "Progress photo not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deleted, "Progress photo deleted successfully"),
      );
  } catch (error) {
    next(error);
  }
}

export const progressPhotoController = {
  createProgressPhoto: createProgressPhotoController,
  getProgressPhotos: getProgressPhotosController,
  deleteProgressPhoto: deleteProgressPhotoController,
};
