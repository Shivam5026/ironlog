import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  exerciseIdParamsSchema,
  historyQuerySchema,
} from "../validations/performance.validation";
import { performanceService } from "../services/performance.service";

export async function getPreviousPerformance(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { exerciseId } = exerciseIdParamsSchema.parse(req.params);
    const performance = await performanceService.getPreviousPerformance(userId, exerciseId);

    return res
      .status(200)
      .json(new ApiResponse(200, performance, "Previous performance fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getPersonalRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const records = await performanceService.getPersonalRecords(userId);

    return res.status(200).json(new ApiResponse(200, records, "Personal records fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getExerciseHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { exerciseId } = exerciseIdParamsSchema.parse(req.params);
    const query = historyQuerySchema.parse(req.query);
    const history = await performanceService.getExerciseHistory(userId, exerciseId, query.limit);

    return res.status(200).json(new ApiResponse(200, history, "Exercise history fetched"));
  } catch (error) {
    next(error);
  }
}
