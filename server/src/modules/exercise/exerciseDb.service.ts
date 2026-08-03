import axios from "axios";
import { exerciseApi } from "./exerciseApi";
import {
  BodyPartQuery,
  EquipmentsQuery,
  ExerciseFilters,
  MusclesQuery,
} from "./exercise.schemas";
import { withCache } from "../../lib/cache";
import type { Exercise } from "./exercise.types";

const CACHE_KEYS = {
  BODY_PARTS: "exercise:bodyparts",
  MUSCLES: "exercise:muscles",
  EQUIPMENTS: "exercise:equipments",
};

const CACHE_TTL = 60 * 60 * 24; // 24 hours

function handleExerciseApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message;

    throw new Error(message);
  }

  throw new Error("Unexpected error while communicating with ExerciseDB.");
}

async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const { data } = await exerciseApi.get<T>(url, {
      params,
    });

    return data;
  } catch (error) {
    handleExerciseApiError(error);
  }
}

export async function getExercises(filters: ExerciseFilters) {
  const params: Record<string, unknown> = {};

  if (filters.search) params.name = filters.search;

  if (filters.bodyParts) params.bodyParts = filters.bodyParts;

  if (filters.targetMuscles)
    params.targetMuscles = filters.targetMuscles;

  if (filters.equipments)
    params.equipments = filters.equipments;

  if (filters.limit) params.limit = filters.limit;

  if ("after" in filters && filters.after)
    params.after = filters.after;

  if ("before" in filters && filters.before)
    params.before = filters.before;

  return get("/exercises", params);
}

export async function getExerciseById(id: string): Promise<Exercise> {
  return get(`/exercises/${id}`);
}

export async function getBodyParts(query?: BodyPartQuery) {
  return withCache(
    CACHE_KEYS.BODY_PARTS,
    () => get("/bodyparts", query),
    CACHE_TTL,
  );
}

export async function getTargetMuscles(query?: MusclesQuery) {
  return withCache(
    CACHE_KEYS.MUSCLES,
    () => get("/muscles", query),
    CACHE_TTL,
  );
}

export async function getEquipments(query?: EquipmentsQuery) {
  return withCache(
    CACHE_KEYS.EQUIPMENTS,
    () => get("/equipments", query),
    CACHE_TTL,
  );
}