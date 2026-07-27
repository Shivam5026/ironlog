import { api } from "./api";
import type { Exercise, ExerciseListResponse } from "../types/exercise";

export interface GetExercisesParams {
  search: string;
  bodyParts: string;
  targetMuscles: string;
  equipments: string;
  limit: number;
  after?: string;
  before?: string;
}

export async function getExercises(
  params: GetExercisesParams = {
    search: "",
    bodyParts: "",
    targetMuscles: "",
    equipments: "",
    limit: 20,
  },
): Promise<ExerciseListResponse> {
  const { data } = await api.get<ExerciseListResponse>("/exercises", {
    params,
  });

  return data;
}

export async function getExerciseById(exerciseId: string): Promise<Exercise> {
  const { data } = await api.get<Exercise>(`/exercises/${exerciseId}`);

  return data;
}

export async function getBodyParts(): Promise<string[]> {
  const { data } = await api.get<string[]>("/body-parts");

  return data;
}

export async function getTargetMuscles(): Promise<string[]> {
  const { data } = await api.get<string[]>("/target-muscles");

  return data;
}

export async function getEquipments(): Promise<string[]> {
  const { data } = await api.get<string[]>("/equipments");

  return data;
}