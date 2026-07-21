import axios from "axios";

export const exerciseApi = axios.create({
  baseURL: process.env.EXERCISE_DB_BASE_URL,
  timeout: 10000,
});