import type { Request, Response, NextFunction } from "express";

import * as exerciseService from "./exerciseDb.service";

import { ApiResponse } from "../../utils/ApiResponse";

import {
  ExerciseParams,
  exerciseFiltersSchema,
} from "./exercise.schemas";

export async function getExercises(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const filters = exerciseFiltersSchema.parse(req.query);

    const exercises = await exerciseService.getExercises(filters);

    return res.status(200).json(
      new ApiResponse(
        200,
        exercises,
        "Exercises fetched successfully",
      ),
    );
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

    return res.status(200).json(
      new ApiResponse(
        200,
        exercise,
        "Exercise fetched successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function getBodyParts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bodyParts = await exerciseService.getBodyParts();

    return res.status(200).json(
      new ApiResponse(
        200,
        bodyParts,
        "Body parts fetched successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function getTargetMuscles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const targetMuscles =
      await exerciseService.getTargetMuscles();

    return res.status(200).json(
      new ApiResponse(
        200,
        targetMuscles,
        "Target muscles fetched successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
}

export async function getEquipments(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const equipments =
      await exerciseService.getEquipments();

    return res.status(200).json(
      new ApiResponse(
        200,
        equipments,
        "Equipments fetched successfully",
      ),
    );
  } catch (error) {
    next(error);
  }
}