import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { recoveryService } from "../services/recovery.service";
import { readinessService } from "../services/readiness.service";
import { recommendationService } from "../services/recommendation.service";
import { exerciseRecommendationService } from "../services/exercise-recommendation.service";
import { overtrainingService } from "../services/overtraining.service";
import { recoveryAnalyticsService } from "../services/recovery-analytics.service";
import { isTrendsRange } from "../utils/recovery-analytics.calculator";

export async function getRecoverySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const summary = await recoveryService.getRecoverySummary(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, summary, "Recovery summary fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getReadiness(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const readiness = await readinessService.getDailyReadiness(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, readiness, "Readiness fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getTodayRecommendation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const recommendation = await recommendationService.getRecommendation(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, recommendation, "Today's recommendation fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getExerciseRecommendations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const recommendations =
      await exerciseRecommendationService.getExerciseRecommendations(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          recommendations,
          "Exercise recommendations fetched",
        ),
      );
  } catch (error) {
    next(error);
  }
}

export async function getRecoveryTimeline(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const timeline = await recoveryService.getRecoveryTimeline(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, timeline, "Recovery timeline fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getRecoveryTrends(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const rawRange = req.query.range;
    if (rawRange !== undefined && !isTrendsRange(rawRange)) {
      throw new ApiError(400, "range must be one of 7d, 30d, 90d");
    }

    const trends = await recoveryAnalyticsService.getRecoveryTrends(userId, {
      range: rawRange as "7d" | "30d" | "90d" | undefined,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, trends, "Recovery trends fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getRecoveryReports(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const rawRange = req.query.range;
    if (rawRange !== undefined && !isTrendsRange(rawRange)) {
      throw new ApiError(400, "range must be one of 7d, 30d, 90d");
    }

    const reports = await recoveryAnalyticsService.getRecoveryReports(userId, {
      range: rawRange as "7d" | "30d" | "90d" | undefined,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, reports, "Recovery reports fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getOvertraining(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const analysis = await overtrainingService.getOvertrainingAnalysis(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, analysis, "Overtraining analysis fetched"));
  } catch (error) {
    next(error);
  }
}
