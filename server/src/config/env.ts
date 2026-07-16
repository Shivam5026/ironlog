import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || "5000",

  NODE_ENV: process.env.NODE_ENV || "development",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  DATABASE_URL: process.env.DATABASE_URL || "",

  REDIS_URL: process.env.REDIS_URL || "",

  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",

  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "",

  EXERCISE_DB_API_KEY: process.env.EXERCISE_DB_API_KEY || "",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};