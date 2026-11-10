import multer from "multer";
import type { RequestHandler } from "express";

import { ApiError } from "../../../utils/ApiError";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

/**
 * MIME types accepted by the upload middleware.
 *
 * This is only a first line of defence: clients can spoof the `Content-Type`
 * of a multipart part, so the actual bytes are validated again in the service
 * layer before the image is sent to Cloudinary.
 */
export const ALLOWED_PROGRESS_PHOTO_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** Maximum accepted progress-photo size in bytes. */
export const MAX_PROGRESS_PHOTO_FILE_SIZE_BYTES = MAX_FILE_SIZE;

/** Multipart field the client must use to send the image. */
export const PROGRESS_PHOTO_FIELD_NAME = "photo";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_PROGRESS_PHOTO_MIME_TYPES.has(file.mimetype)) {
      callback(
        new ApiError(400, "Only JPEG, PNG, and WebP images are allowed."),
      );
      return;
    }

    callback(null, true);
  },
});

const uploadSinglePhoto = upload.single(PROGRESS_PHOTO_FIELD_NAME);

/**
 * Accepts a single image in the `photo` multipart field using in-memory
 * storage, rejecting anything larger than 5 MB or outside the allow-listed
 * image formats before it can reach Cloudinary.
 *
 * Multer reports its own failures (e.g. `LIMIT_FILE_SIZE`) as plain errors,
 * which the global error handler would surface as a 500. They are normalised
 * to `ApiError`s here so malformed uploads are consistently a 400.
 */
export const uploadProgressPhoto: RequestHandler = (req, res, next) => {
  uploadSinglePhoto(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? `Image must be ${MAX_FILE_SIZE_MB} MB or smaller.`
          : error.message;

      next(new ApiError(400, message));
      return;
    }

    next(error);
  });
};
