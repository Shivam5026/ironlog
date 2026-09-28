import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { analyticsQuerySchema, muscleFrequencyQuerySchema, consistencyQuerySchema } from "../validations/analytics.validation";
import { analyticsService } from "../services/analytics.service";
import { ProgressiveOverloadService } from "../services/progressive-overload.service";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { prisma } from "../../../config/prisma";
import {
  getDashboardCache,
  setDashboardCache,
} from "../services/cache.service";

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
    const result = await analyticsService.getVolumeAnalytics(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Volume analytics fetched"));
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
    const result = await analyticsService.getWorkoutFrequency(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Workout frequency fetched"));
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
    const result = await analyticsService.getExerciseDistribution(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Exercise distribution fetched"));
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
    const result = await analyticsService.getMuscleDistribution(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Muscle distribution fetched"));
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

    const result = await analyticsService.getStatistics(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Statistics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getExerciseVolume(
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
    const result = await analyticsService.getExerciseVolumeAnalytics(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Exercise volume analytics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getMuscleGroupVolume(
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
    const result = await analyticsService.getMuscleGroupVolumeAnalytics(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Muscle group volume analytics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getProgressTrends(
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
    const result = await analyticsService.getProgressTrends(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Progress trends fetched"));
  } catch (error) {
    next(error);
  }
}

async function getExerciseProgressMetrics(
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
    const result = await analyticsService.getExerciseProgressMetrics(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Exercise progress metrics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getVolumeComparison(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const exerciseId = req.query.exerciseId as string | undefined;
    const workoutSessionId = req.query.workoutSessionId as string | undefined;

    if (!exerciseId || !workoutSessionId) {
      throw new ApiError(400, "exerciseId and workoutSessionId are required");
    }

    const result = await analyticsService.getVolumeComparison(
      userId,
      exerciseId,
      workoutSessionId,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Volume comparison fetched"));
  } catch (error) {
    next(error);
  }
}

const progressiveOverloadService = new ProgressiveOverloadService(
  new AnalyticsRepository(prisma),
);

async function getOverloadDetection(
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
    const result = await progressiveOverloadService.getOverloadDetection(
      userId,
      range,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Overload detection fetched"));
  } catch (error) {
    next(error);
  }
}

async function getPlateauDetection(
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
    const result = await progressiveOverloadService.detectPlateaus(
      userId,
      range,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Plateau detection fetched"));
  } catch (error) {
    next(error);
  }
}

async function getMuscleFrequency(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range, view } = muscleFrequencyQuerySchema.parse(req.query);

    if (view === "balance") {
      const result = await analyticsService.getMuscleBalance(userId, range);
      return res
        .status(200)
        .json(new ApiResponse(200, result.data, "Muscle balance fetched"));
    }

    if (view === "heatmap") {
      const result = await analyticsService.getMuscleHeatmap(userId, range);
      return res
        .status(200)
        .json(new ApiResponse(200, result.data, "Muscle heatmap fetched"));
    }

    const result = await analyticsService.getMuscleFrequency(userId, range);
    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Muscle frequency fetched"));
  } catch (error) {
    next(error);
  }
}

async function getConsistencyFrequency(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { range } = consistencyQuerySchema.parse(req.query);
    const result = await analyticsService.getConsistencyFrequency(userId, range);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Consistency analytics fetched"));
  } catch (error) {
    next(error);
  }
}

async function getDashboardAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const cached = await getDashboardCache(userId);
    if (cached) {
      return res
        .status(200)
        .json(new ApiResponse(200, cached, "Dashboard analytics fetched (cached)"));
    }

    const result = await analyticsService.getDashboardAnalytics(userId);
    await setDashboardCache(userId, result);

    return res
      .status(200)
      .json(new ApiResponse(200, result.data, "Dashboard analytics fetched"));
  } catch (error) {
    next(error);
  }
}

export const analyticsController = {
  getStatistics,
  getVolumeAnalytics,
  getExerciseVolume,
  getMuscleGroupVolume,
  getProgressTrends,
  getWorkoutFrequency,
  getExerciseDistribution,
  getMuscleDistribution,
  getExerciseProgressMetrics,
  getVolumeComparison,
  getOverloadDetection,
  getPlateauDetection,
  getMuscleFrequency,
  getConsistencyFrequency,
  getDashboardAnalytics,
};
