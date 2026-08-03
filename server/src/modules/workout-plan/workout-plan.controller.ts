import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createPlanSchema,
  updatePlanSchema,
  planIdSchema,
  createDaySchema,
  dayIdSchema,
} from "./workout-plan.schema";
import { workoutPlanService } from "./workout-plan.service";

export async function createPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createPlanSchema.parse(req.body);
    const plan = await workoutPlanService.createPlan(userId, data);

    return res.status(201).json(new ApiResponse(201, plan, "Plan created"));
  } catch (error) {
    next(error);
  }
}

export async function getPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const plans = await workoutPlanService.getPlans(userId);

    return res.status(200).json(new ApiResponse(200, plans, "Plans fetched"));
  } catch (error) {
    next(error);
  }
}

export async function getPlanById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = planIdSchema.parse(req.params);
    const plan = await workoutPlanService.getPlanById(id);

    if (!plan) {
      throw new ApiError(404, "Plan not found");
    }

    if (plan.userId !== userId) {
      throw new ApiError(403, "Forbidden");
    }

    return res.status(200).json(new ApiResponse(200, plan, "Plan fetched"));
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = planIdSchema.parse(req.params);
    const data = updatePlanSchema.parse(req.body);
    const plan = await workoutPlanService.updatePlan(id, userId, data);

    return res.status(200).json(new ApiResponse(200, plan, "Plan updated"));
  } catch (error) {
    next(error);
  }
}

export async function duplicatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = planIdSchema.parse(req.params);
    const plan = await workoutPlanService.duplicatePlan(id, userId);

    return res.status(201).json(new ApiResponse(201, plan, "Plan duplicated"));
  } catch (error) {
    next(error);
  }
}

export async function deletePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = planIdSchema.parse(req.params);
    await workoutPlanService.deletePlan(id, userId);

    return res.status(200).json(new ApiResponse(200, null, "Plan deleted"));
  } catch (error) {
    next(error);
  }
}

export async function addDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = planIdSchema.parse(req.params);
    const data = createDaySchema.parse(req.body);
    const day = await workoutPlanService.addDay(id, userId, data);

    return res.status(201).json(new ApiResponse(201, day, "Day added"));
  } catch (error) {
    next(error);
  }
}

export async function removeDay(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { dayId } = dayIdSchema.parse(req.params);
    await workoutPlanService.removeDay(dayId, userId);

    return res.status(200).json(new ApiResponse(200, null, "Day removed"));
  } catch (error) {
    next(error);
  }
}

