import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { analyticsQuerySchema } from "../validations/analytics.validation";
import { analyticsService } from "../services/analytics.service";

async function getVolumeAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range } = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getVolumeAnalytics(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Volume analytics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getWorkoutFrequency(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range } = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getWorkoutFrequency(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Workout frequency fetched"));
  } catch (error) {
    next(error);
  }
}

async function getExerciseDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range } = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getExerciseDistribution(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Exercise distribution fetched"));
  } catch (error) {
    next(error);
  }
}

async function getMuscleDistribution(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range } = analyticsQuerySchema.parse(req.query);
    const data = await analyticsService.getMuscleDistribution(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Muscle distribution fetched"));
  } catch (error) {
    next(error);
  }
}

async function getStatistics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = await analyticsService.getStatistics(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Statistics fetched"));
  } catch (error) {
    next(error);
  }
}

export const analyticsController = {
  getStatistics,
  getVolumeAnalytics,
  getWorkoutFrequency,
  getExerciseDistribution,
  getMuscleDistribution,
};
