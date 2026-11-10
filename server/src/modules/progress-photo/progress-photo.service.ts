import { Readable } from "node:stream";

import sharp from "sharp";
import type { UploadApiResponse } from "cloudinary";

import cloudinary from "../../config/cloudinary";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type {
  ProgressPhoto,
  ProgressPhotoCategory,
} from "../../generated/prisma/client";

const MAX_PIXELS = 40_000_000;
const SUPPORTED_IMAGE_FORMATS = new Set(["jpeg", "png", "webp"]);

interface CreateProgressPhotoInput {
  userId: string;
  file: Express.Multer.File;
  category: ProgressPhotoCategory;
  weight?: number;
  notes?: string;
  recordedAt?: Date;
}

function roundWeight(weight: number): number {
  return Math.round(weight * 100) / 100;
}

async function uploadToCloudinary(
  buffer: Buffer,
  userId: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ironlog/progress-photos/${userId}`,
        resource_type: "image",
        format: "webp",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary returned no upload result."));
          return;
        }

        resolve(result);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}

/**
 * Confirms the bytes really are a supported image (the multipart MIME type
 * can be spoofed), rejects absurdly large dimensions, and re-encodes the
 * image to a bounded-size WebP before it is uploaded.
 */
async function validateAndOptimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    const metadata = await sharp(buffer, { failOn: "error" }).metadata();

    if (!SUPPORTED_IMAGE_FORMATS.has(metadata.format ?? "")) {
      throw new ApiError(400, "Only JPEG, PNG, and WebP images are allowed.");
    }

    if (!metadata.width || !metadata.height) {
      throw new ApiError(400, "The image dimensions are invalid or too large.");
    }

    if (metadata.width * metadata.height > MAX_PIXELS) {
      throw new ApiError(400, "The image dimensions are invalid or too large.");
    }

    return await sharp(buffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "The uploaded file is not a valid supported image.");
  }
}

/**
 * Best-effort removal of an already-uploaded Cloudinary asset. Cleanup must
 * never mask the original failure, so errors are logged and swallowed.
 */
async function destroyCloudinaryImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (cleanupError) {
    console.error(
      "Failed to clean up Cloudinary image after database failure:",
      cleanupError,
    );
  }
}

export async function createProgressPhoto(
  input: CreateProgressPhotoInput,
): Promise<ProgressPhoto> {
  const { userId, file, category, weight, notes, recordedAt } = input;

  if (!file?.buffer?.length) {
    throw new ApiError(400, "A photo file is required.");
  }

  const optimizedBuffer = await validateAndOptimizeImage(file.buffer);
  const uploaded = await uploadToCloudinary(optimizedBuffer, userId);

  try {
    return await prisma.progressPhoto.create({
      data: {
        userId,
        imageUrl: uploaded.secure_url,
        cloudinaryPublicId: uploaded.public_id,
        category,
        ...(weight !== undefined && { weight: roundWeight(weight) }),
        notes,
        recordedAt: recordedAt ?? new Date(),
      },
    });
  } catch (error) {
    await destroyCloudinaryImage(uploaded.public_id);
    throw error;
  }
}

export async function deleteProgressPhoto(
  photoId: string,
  userId: string,
): Promise<{ id: string } | null> {
  // Scoping the lookup by userId is what makes deleting someone else's photo
  // indistinguishable from deleting a photo that does not exist (both null).
  const photo = await prisma.progressPhoto.findFirst({
    where: {
      id: photoId,
      userId,
    },
  });

  if (!photo) {
    return null;
  }

  // Remove the storage asset first. If Cloudinary fails we abort before
  // touching the row, so the record (and a retry) remains possible instead of
  // silently orphaning the image.
  const result = await cloudinary.uploader.destroy(photo.cloudinaryPublicId, {
    resource_type: "image",
    invalidate: true,
  });

  const outcome = result?.result;
  if (outcome !== "ok" && outcome !== "not found") {
    throw new Error("Failed to delete the progress photo from storage.");
  }

  await prisma.progressPhoto.delete({
    where: { id: photo.id },
  });

  return { id: photo.id };
}

export interface ProgressPhotoPagination {
  limit?: number;
  offset?: number;
}

/**
 * Timeline feed for the authenticated user. Photos are ordered by the date
 * they were recorded (newest first) with creation time as a stable tiebreaker,
 * so several photos added on the same day still have deterministic ordering.
 *
 * `cloudinaryPublicId` is intentionally not selected: it is an internal
 * storage identifier and must never leave the server.
 */
export async function getProgressPhotos(
  userId: string,
  pagination: ProgressPhotoPagination = {},
) {
  const { limit, offset } = pagination;

  return prisma.progressPhoto.findMany({
    where: { userId },
    orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
    ...(limit !== undefined && { take: limit }),
    ...(offset !== undefined && { skip: offset }),
    select: {
      id: true,
      imageUrl: true,
      category: true,
      weight: true,
      notes: true,
      recordedAt: true,
      createdAt: true,
    },
  });
}

/** Total number of photos owned by the user (used for pagination metadata). */
export async function countProgressPhotos(userId: string): Promise<number> {
  return prisma.progressPhoto.count({ where: { userId } });
}

export const progressPhotoService = {
  createProgressPhoto,
  deleteProgressPhoto,
  getProgressPhotos,
  countProgressPhotos,
};
