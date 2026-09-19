import { z } from "zod";

// GET /api/dashboard accepts no query parameters today.
// Reserved for future scoping (date range, timezone, etc.).
export const dashboardQuerySchema = z.object({});