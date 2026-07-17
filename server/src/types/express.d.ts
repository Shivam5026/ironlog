import "express";

declare global {
  namespace Express {
    interface Request {
      user?: unknown;
      session?: unknown;
    }
  }
}

export {};