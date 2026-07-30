import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createWorkoutDaySchema,
  updateWorkoutDaySchema,
  workoutDayIdSchema,
  reorderWorkoutDaysSchema,
} from "./workout-day.schema";
import { workoutDayService } from "./workout-day.service";

export async function createWorkoutDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createWorkoutDaySchema.parse(req.body);
    const day = await workoutDayService.createWorkoutDay(userId, data);

    return res.status(201).json(new ApiResponse(201, day, "Workout day created"));
  } catch (error) {
    next(error);
  }
}

export async function updateWorkoutDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutDayIdSchema.parse(req.params);
    const data = updateWorkoutDaySchema.parse(req.body);
    const day = await workoutDayService.updateWorkoutDay(id, userId, data);

    return res.status(200).json(new ApiResponse(200, day, "Workout day updated"));
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkoutDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutDayIdSchema.parse(req.params);
    await workoutDayService.deleteWorkoutDay(id, userId);

    return res.status(200).json(new ApiResponse(200, null, "Workout day deleted"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutDayIdSchema.parse(req.params);
    const day = await workoutDayService.getWorkoutDay(id, userId);

    return res.status(200).json(new ApiResponse(200, day, "Workout day fetched"));
  } catch (error) {
    next(error);
  }
}

export async function reorderWorkoutDays(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = reorderWorkoutDaysSchema.parse(req.body);
    await workoutDayService.reorderWorkoutDays(userId, data);

    return res.status(200).json(new ApiResponse(200, null, "Workout days reordered"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutDays(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { workoutPlanId } = req.query;
    if (typeof workoutPlanId !== "string" || !workoutPlanId) {
      throw new ApiError(400, "workoutPlanId query param is required");
    }

    const days = await workoutDayService.getWorkoutDays(workoutPlanId, userId);

    return res.status(200).json(new ApiResponse(200, days, "Workout days fetched"));
  } catch (error) {
    next(error);
  }
}
