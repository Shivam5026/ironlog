import type { NextFunction, Request, Response } from "express";

import { getSession } from "../utils/getSession";
import { ApiError } from "../utils/ApiError";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const session = await getSession(req);

    if (!session) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    next(error);
  }
}