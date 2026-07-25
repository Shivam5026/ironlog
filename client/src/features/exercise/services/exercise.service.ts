import { api } from "./api";
import type { SearchExercisesResponse } from "../types/exercise";

export interface SearchExercisesParams {
  search: string;
  threshold?: number;
}

export async function searchExercises({
  search,
  threshold = 0.5,
}: SearchExercisesParams): Promise<SearchExercisesResponse> {
  const { data } = await api.get<SearchExercisesResponse>(
    "/exercises/search",
    {
      params: {
        search,
        threshold,
      },
    }
  );

  return data;
}

export async function getExerciseById(
  exerciseId: string
) {
  const { data } = await api.get(
    `/exercises/${exerciseId}`
  );

  return data;
}