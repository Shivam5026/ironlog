import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  createExerciseLogSchema,
  updateExerciseLogSchema,
  exerciseLogParamsSchema,
} from "../validations/exercise-log.validation";
import { exerciseLogService } from "../services/exercise-log.service";

export async function createExerciseLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createExerciseLogSchema.parse(req.body);
    const log = await exerciseLogService.createExerciseLog(userId, data);

    return res.status(201).json(new ApiResponse(201, log, "Exercise log created"));
  } catch (error) {
    next(error);
  }
}

export async function getExerciseLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogParamsSchema.parse(req.params);
    const log = await exerciseLogService.getExerciseLog(id, userId);

    return res.status(200).json(new ApiResponse(200, log, "Exercise log fetched"));
  } catch (error) {
    next(error);
  }
}

export async function updateExerciseLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogParamsSchema.parse(req.params);
    const data = updateExerciseLogSchema.parse(req.body);
    const log = await exerciseLogService.updateExerciseLog(id, userId, data);

    return res.status(200).json(new ApiResponse(200, log, "Exercise log updated"));
  } catch (error) {
    next(error);
  }
}

export async function deleteExerciseLog(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogParamsSchema.parse(req.params);
    await exerciseLogService.deleteExerciseLog(id, userId);

    return res.status(200).json(new ApiResponse(200, null, "Exercise log deleted"));
  } catch (error) {
    next(error);
  }
}
