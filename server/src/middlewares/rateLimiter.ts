import { rateLimit } from "express-rate-limit";

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // dev (and e2e) generates far more than 100 requests per 15min from one IP
  limit: process.env.NODE_ENV === "production" ? 100 : 5000,
  standardHeaders: true,
  legacyHeaders: false,
});