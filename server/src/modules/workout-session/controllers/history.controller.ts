import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  historyQuerySchema,
  historyParamsSchema,
} from "../validations/history.validation";
import { historyService } from "../services/history.service";

export async function getWorkoutHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const filters = historyQuerySchema.parse(req.query);
    const history = await historyService.getWorkoutHistory(userId, filters);

    return res.status(200).json(new ApiResponse(200, history, "Workout history fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = historyParamsSchema.parse(req.params);
    const details = await historyService.getWorkoutDetails(sessionId, userId);

    return res.status(200).json(new ApiResponse(200, details, "Workout details fetched"));
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = historyParamsSchema.parse(req.params);
    await historyService.deleteWorkout(sessionId, userId);

    return res.status(200).json(new ApiResponse(200, null, "Workout deleted"));
  } catch (error) {
    next(error);
  }
}
