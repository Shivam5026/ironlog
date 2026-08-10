import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { recoverySessionIdSchema } from "../validations/recovery.validation";
import { recoveryService } from "../services/recovery.service";

export async function getActiveSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const session = await recoveryService.getActiveSession(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, session, "Active session fetched"));
  } catch (error) {
    next(error);
  }
}

export async function recoverSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = recoverySessionIdSchema.parse(req.params);
    const session = await recoveryService.recoverSession(sessionId, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, session, "Workout session recovered"));
  } catch (error) {
    next(error);
  }
}

export async function clearRecoveredSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = recoverySessionIdSchema.parse(req.params);
    const session = await recoveryService.clearRecoveredSession(sessionId, userId);

    return res
      .status(200)
      .json(new ApiResponse(200, session, "Recovered session cleared"));
  } catch (error) {
    next(error);
  }
}
