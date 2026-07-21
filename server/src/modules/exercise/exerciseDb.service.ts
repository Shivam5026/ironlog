import axios from "axios";

import { exerciseApi } from "./exerciseApi";

function handleExerciseApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    throw new Error(
      error.response?.data?.message ??
        "Unable to fetch exercise data."
    );
  }

  throw new Error("Unexpected error while fetching exercises.");
}

export async function getExercises() {
  try {
    const response = await exerciseApi.get("/exercises");

    return response.data;
  } catch (error) {
    handleExerciseApiError(error);
  }
}