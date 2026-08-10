import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { workoutSummarySessionIdSchema } from "../validations/workout-summary.validation";
import { workoutSummaryService } from "../services/workout-summary.service";

export async function getWorkoutSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = workoutSummarySessionIdSchema.parse(req.params);
    const summary = await workoutSummaryService.getWorkoutSummary(sessionId, userId);

    return res.status(200).json(new ApiResponse(200, summary, "Workout summary fetched"));
  } catch (error) {
    next(error);
  }
}

export async function completeWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { sessionId } = workoutSummarySessionIdSchema.parse(req.params);
    const summary = await workoutSummaryService.completeWorkout(userId, sessionId);

    return res.status(200).json(new ApiResponse(200, summary, "Workout completed"));
  } catch (error) {
    next(error);
  }
}