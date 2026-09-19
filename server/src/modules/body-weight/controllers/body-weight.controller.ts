import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import {
  bodyWeightHistoryQuerySchema,
  bodyWeightIdSchema,
  createBodyWeightSchema,
  updateBodyWeightSchema,
} from "../validations/body-weight.validation";
import { bodyWeightService } from "../services/body-weight.service";

async function createBodyWeight(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createBodyWeightSchema.parse(req.body);
    const entry = await bodyWeightService.createBodyWeight(userId, data);

    return res
      .status(201)
      .json(new ApiResponse(201, entry, "Body weight logged"));
  } catch (error) {
    next(error);
  }
}

async function getBodyWeightHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { limit } = bodyWeightHistoryQuerySchema.parse(req.query);
    const history = await bodyWeightService.getBodyWeightHistory(userId, limit);

    return res
      .status(200)
      .json(new ApiResponse(200, history, "Body weight history fetched"));
  } catch (error) {
    next(error);
  }
}

async function updateBodyWeight(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = bodyWeightIdSchema.parse(req.params);
    const data = updateBodyWeightSchema.parse(req.body);
    const entry = await bodyWeightService.updateBodyWeight(id, userId, data);

    return res
      .status(200)
      .json(new ApiResponse(200, entry, "Body weight updated"));
  } catch (error) {
    next(error);
  }
}

async function deleteBodyWeight(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = bodyWeightIdSchema.parse(req.params);
    await bodyWeightService.deleteBodyWeight(id, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Body weight deleted"));
  } catch (error) {
    next(error);
  }
}

export const bodyWeightController = {
  createBodyWeight,
  getBodyWeightHistory,
  updateBodyWeight,
  deleteBodyWeight,
};
