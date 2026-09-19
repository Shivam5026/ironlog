import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  workoutHistoryParamsSchema,
  workoutHistoryQuerySchema,
} from "../validations/workout-history.validation";
import { workoutHistoryService } from "../services/workout-history.service";

async function getWorkoutHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const query = workoutHistoryQuerySchema.parse(req.query);
    const page = await workoutHistoryService.getWorkoutHistory(userId, query);

    return res
      .status(200)
      .json(new ApiResponse(200, page, "Workout history fetched"));
  } catch (error) {
    next(error);
  }
}

async function getWorkoutDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutHistoryParamsSchema.parse(req.params);
    const detail = await workoutHistoryService.getWorkoutDetail(userId, id);

    return res
      .status(200)
      .json(new ApiResponse(200, detail, "Workout details fetched"));
  } catch (error) {
    next(error);
  }
}

export const workoutHistoryController = {
  getWorkoutHistory,
  getWorkoutDetail,
};