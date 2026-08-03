import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  workoutPlanId: z.string().min(1),
});

export const useTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

export const deleteTemplateSchema = z.object({
  templateId: z.string(),
});

export const templateIdSchema = z.object({
  templateId: z.string().min(1),
});
