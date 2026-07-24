import axios from "axios";
import { exerciseApi } from "./exerciseApi";
import {
  BodyPartQuery,
  EquipmentsQuery,
  MusclesQuery,
} from "./exercise.schemas";
import { withCache } from "../../lib/cache";

function handleExerciseApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message;

    throw new Error(msg);
  }

  throw new Error("Unexpected error while fetching exercises.");
}

async function get<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await exerciseApi.get(url, { params });
    return response.data;
  } catch (error) {
    handleExerciseApiError(error);
  }
}

function createCacheKey(prefix: string, params: Record<string, unknown>) {
  const query = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      query.append(key, String(value));
    });

  return `${prefix}:${query.toString()}`;
}

export function getExercises() {
  return withCache("exercise:all", () => get("/exercises"));
}

export function getExerciseById(id: string) {
  return withCache(`exercise:id:${id}`, () => get(`/exercises/${id}`));
}

export function searchExercises(search: string, threshold = 0.5) {
  return withCache(`exercise:search:${search}:${threshold}`, () =>
    get("/exercises/search", {
      search,
      threshold,
    }),
  );
}

export function getExercisesByBodyPart(params: BodyPartQuery) {
  const key = createCacheKey("exercise:bodypart", params);

  return withCache(key, () => get("/exercises/bodyparts", params));
}

export function getExercisesByMuscles(params: MusclesQuery) {
  const key = createCacheKey("exercise:muscles", params);

  return withCache(key, () => get("/exercises/muscles", params));
}

export function getExercisesByEquipments(params: EquipmentsQuery) {
  const key = createCacheKey("exercise:equipments", params);

  return withCache(key, () => get("/exercises/equipments", params));
}
