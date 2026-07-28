import { api } from "./api";
import type { Exercise, ExerciseListResponse } from "../types/exercise";

interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

interface ExerciseListPayload {
  success: boolean;
  meta: ExerciseListResponse["meta"];
  data: Exercise[];
}

interface ExercisePayload {
  success: boolean;
  data: Exercise;
}

export interface GetExercisesParams {
  search?: string;
  bodyParts?: string;
  targetMuscles?: string;
  equipments?: string;
  limit?: number;
  after?: string;
  before?: string;
}

export async function getExercises(
  params: GetExercisesParams = { limit: 20 },
): Promise<ExerciseListResponse> {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  );

  const { data } = await api.get<ApiResponse<ExerciseListPayload>>("/exercises", {
    params: cleanedParams,
  });

  return {
    meta: data.data.meta,
    data: data.data.data,
  };
}

export async function getExerciseById(exerciseId: string): Promise<Exercise> {
  const { data } = await api.get<ApiResponse<ExercisePayload>>(
  `/exercises/${exerciseId}`,
);

return data.data.data;
}

interface LookupPayload {
  success: boolean;
  data: string[];
}

export async function getBodyParts(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<LookupPayload>>("/body-parts");

  return data.data.data;
}

export async function getTargetMuscles(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<LookupPayload>>("/target-muscles");

  return data.data.data;
}


export async function getEquipments(): Promise<string[]> {
  const { data } = await api.get<ApiResponse<LookupPayload>>("/equipments");

  return data.data.data;
}
