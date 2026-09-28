import { z } from "zod";

export const analyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "all"]).default("30d"),
});

export const muscleFrequencyQuerySchema = z.object({
  range: z.enum(["weekly", "monthly"]).default("weekly"),
  view: z.enum(["frequency", "balance", "heatmap"]).default("frequency"),
});

export const consistencyQuerySchema = z.object({
  range: z.enum(["weekly", "monthly"]).default("weekly"),
});
