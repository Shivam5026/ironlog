import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { streakService } from "../services/streak.service";

async function getStreak(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const streak = await streakService.getStreak(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, streak, "Streak fetched"));
  } catch (error) {
    next(error);
  }
}

export const streakController = {
  getStreak,
};
