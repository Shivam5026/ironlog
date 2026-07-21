import type { Request, Response, NextFunction } from "express";

import * as exerciseService from "./exerciseDb.service";

import { ApiResponse } from "../../utils/ApiResponse";

export async function getExercises(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const exercises = await exerciseService.getExercises();

    return res
      .status(200)
      .json(new ApiResponse(200, exercises, "Exercises fetched successfully"));
  } catch (error) {
    next(error);
  }
}
