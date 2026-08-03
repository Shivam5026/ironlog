import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createWorkoutExerciseSchema,
  updateWorkoutExerciseSchema,
  workoutExerciseIdSchema,
  replaceWorkoutExerciseSchema,
  reorderWorkoutExercisesSchema,
} from "./workout-exercise.schema";
import { workoutExerciseService } from "./workout-exercise.service";

export async function createWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createWorkoutExerciseSchema.parse(req.body);
    const exercise = await workoutExerciseService.createWorkoutExercise(userId, data);

    return res.status(201).json(new ApiResponse(201, exercise, "Workout exercise created"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { workoutDayId } = req.query;
    if (typeof workoutDayId !== "string" || !workoutDayId) {
      throw new ApiError(400, "workoutDayId query param is required");
    }

    const exercises = await workoutExerciseService.getWorkoutExercises(workoutDayId, userId);

    return res.status(200).json(new ApiResponse(200, exercises, "Workout exercises fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutExerciseIdSchema.parse(req.params);
    const exercise = await workoutExerciseService.getWorkoutExercise(id, userId);

    return res.status(200).json(new ApiResponse(200, exercise, "Workout exercise fetched"));
  } catch (error) {
    next(error);
  }
}

export async function updateWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutExerciseIdSchema.parse(req.params);
    const data = updateWorkoutExerciseSchema.parse(req.body);
    const exercise = await workoutExerciseService.updateWorkoutExercise(id, userId, data);

    return res.status(200).json(new ApiResponse(200, exercise, "Workout exercise updated"));
  } catch (error) {
    next(error);
  }
}

export async function replaceWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutExerciseIdSchema.parse(req.params);
    const data = replaceWorkoutExerciseSchema.parse(req.body);
    const exercise = await workoutExerciseService.replaceWorkoutExercise(id, data, userId);

    return res.status(200).json(new ApiResponse(200, exercise, "Workout exercise replaced"));
  } catch (error) {
    next(error);
  }
}

export async function reorderWorkoutExercises(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = reorderWorkoutExercisesSchema.parse(req.body);
    await workoutExerciseService.reorderWorkoutExercises(userId, data);

    return res.status(200).json(new ApiResponse(200, null, "Workout exercises reordered"));
  } catch (error) {
    next(error);
  }
}

export async function deleteWorkoutExercise(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = workoutExerciseIdSchema.parse(req.params);
    await workoutExerciseService.deleteWorkoutExercise(id, userId);

    return res.status(200).json(new ApiResponse(200, null, "Workout exercise deleted"));
  } catch (error) {
    next(error);
  }
}
