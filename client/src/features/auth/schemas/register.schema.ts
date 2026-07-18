import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(50, "Name must not exceed 50 characters."),

    email: z.email("Please enter a valid email address.").trim().toLowerCase(),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .regex(/[A-Z]/, "One uppercase letter required.")
      .regex(/[a-z]/, "One lowercase letter required.")
      .regex(/[0-9]/, "One number required.")
      .regex(/[^A-Za-z0-9]/, "One special character required."),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
