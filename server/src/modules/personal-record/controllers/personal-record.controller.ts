import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { personalRecordParamsSchema } from "../validations/personal-record.validation";
import { personalRecordService } from "../services/personal-record.service";

async function getPersonalRecords(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const records = await personalRecordService.getPersonalRecords(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, records, "Personal records fetched"));
  } catch (error) {
    next(error);
  }
}

async function getPersonalRecord(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { exerciseId } = personalRecordParamsSchema.parse(req.params);
    const record = await personalRecordService.getPersonalRecord(
      userId,
      exerciseId,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, record, "Personal record fetched"));
  } catch (error) {
    next(error);
  }
}

export const personalRecordController = {
  getPersonalRecords,
  getPersonalRecord,
};
