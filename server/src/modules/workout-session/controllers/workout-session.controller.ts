import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { startWorkoutSchema, sessionIdSchema } from "../validations/workout-session.validation";
import { workoutSessionService } from "../services/workout-session.service";

export async function startWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = startWorkoutSchema.parse(req.body);
    const session = await workoutSessionService.startWorkout(userId, data);

    return res.status(201).json(new ApiResponse(201, session, "Workout started"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = sessionIdSchema.parse(req.params);
    const session = await workoutSessionService.getSession(id, userId);

    return res.status(200).json(new ApiResponse(200, session, "Session fetched"));
  } catch (error) {
    next(error);
  }
}

export async function pauseWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = sessionIdSchema.parse(req.params);
    const session = await workoutSessionService.pauseWorkout(id, userId);

    return res.status(200).json(new ApiResponse(200, session, "Workout paused"));
  } catch (error) {
    next(error);
  }
}

export async function resumeWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = sessionIdSchema.parse(req.params);
    const session = await workoutSessionService.resumeWorkout(id, userId);

    return res.status(200).json(new ApiResponse(200, session, "Workout resumed"));
  } catch (error) {
    next(error);
  }
}

export async function finishWorkout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = sessionIdSchema.parse(req.params);
    const session = await workoutSessionService.finishWorkout(id, userId);

    return res.status(200).json(new ApiResponse(200, session, "Workout finished"));
  } catch (error) {
    next(error);
  }
}
