import type { Request, Response, NextFunction } from "express";

import * as exerciseService from "./exerciseDb.service";

import { ApiResponse } from "../../utils/ApiResponse";
import {
  bodyPartSchema,
  equipmentSchema,
  ExerciseParams,
  exerciseSearchSchema,
  muscleSchema,
} from "./exercise.schemas";

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

export async function getExerciseById(
  req: Request<ExerciseParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const exercise = await exerciseService.getExerciseById(id);

    return res
      .status(200)
      .json(new ApiResponse(200, exercise, "Exercise fetched successfully."));
  } catch (error) {
    next(error);
  }
}

export async function searchExercises(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { search, threshold = 0.5 } = exerciseSearchSchema.parse(req.query);

    const result = await exerciseService.searchExercises(search, threshold);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getExercisesByBodyPart(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = bodyPartSchema.parse(req.query);

    const result = await exerciseService.getExercisesByBodyPart(query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getExercisesByMuscles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = muscleSchema.parse(req.query);

    const result = await exerciseService.getExercisesByMuscles(query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getExercisesByEquipments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = equipmentSchema.parse(req.query);

    const result = await exerciseService.getExercisesByEquipments(query);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
