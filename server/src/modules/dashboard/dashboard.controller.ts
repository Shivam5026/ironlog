import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { dashboardService } from "./dashboard.service";

async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const stats = await dashboardService.getDashboardStats(userId);

    return res.status(200).json(new ApiResponse(200, stats, "Stats fetched"));
  } catch (error) {
    next(error);
  }
}

async function getRecentPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const plans = await dashboardService.getRecentPlans(userId);

    return res.status(200).json(new ApiResponse(200, plans, "Recent plans fetched"));
  } catch (error) {
    next(error);
  }
}

async function getRecentTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const templates = await dashboardService.getRecentTemplates(userId);

    return res.status(200).json(new ApiResponse(200, templates, "Recent templates fetched"));
  } catch (error) {
    next(error);
  }
}

export const dashboardController = {
  getStats,
  getRecentPlans,
  getRecentTemplates,
};
