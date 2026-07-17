import type { z } from "zod";
import {
  loginSchema,
  registerSchema,
} from "./auth.schemas";

export type RegisterDto =
  z.infer<typeof registerSchema>;

export type LoginDto =
  z.infer<typeof loginSchema>;