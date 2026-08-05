import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  createExerciseLogSetSchema,
  updateExerciseLogSetSchema,
  completeExerciseLogSetSchema,
  reorderExerciseLogSetSchema,
  exerciseLogSetParamsSchema,
} from "../validations/exercise-log-set.validation";
import { exerciseLogSetService } from "../services/exercise-log-set.service";

export async function createExerciseLogSet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createExerciseLogSetSchema.parse(req.body);
    const set = await exerciseLogSetService.createSet(userId, data);

    return res.status(201).json(new ApiResponse(201, set, "Set created"));
  } catch (error) {
    next(error);
  }
}

export async function updateExerciseLogSet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogSetParamsSchema.parse(req.params);
    const data = updateExerciseLogSetSchema.parse(req.body);
    const set = await exerciseLogSetService.updateSet(id, userId, data);

    return res.status(200).json(new ApiResponse(200, set, "Set updated"));
  } catch (error) {
    next(error);
  }
}

export async function deleteExerciseLogSet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogSetParamsSchema.parse(req.params);
    await exerciseLogSetService.deleteSet(id, userId);

    return res.status(200).json(new ApiResponse(200, null, "Set deleted"));
  } catch (error) {
    next(error);
  }
}

export async function completeExerciseLogSet(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = exerciseLogSetParamsSchema.parse(req.params);
    const data = completeExerciseLogSetSchema.parse(req.body);
    const set = await exerciseLogSetService.completeSet(id, userId, data);

    return res.status(200).json(new ApiResponse(200, set, "Set updated"));
  } catch (error) {
    next(error);
  }
}

export async function reorderExerciseLogSets(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = reorderExerciseLogSetSchema.parse(req.body);
    const sets = await exerciseLogSetService.reorderSets(userId, data);

    return res.status(200).json(new ApiResponse(200, sets, "Sets reordered"));
  } catch (error) {
    next(error);
  }
}
