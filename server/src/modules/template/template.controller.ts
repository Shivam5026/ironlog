import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createTemplateSchema,
  useTemplateSchema,
  updateTemplateSchema,
  deleteTemplateSchema,
  templateIdSchema,
} from "./template.schema";
import { templateService } from "./template.service";

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const data = createTemplateSchema.parse(req.body);
    const template = await templateService.createTemplate(userId, data);

    return res.status(201).json(new ApiResponse(201, template, "Template created"));
  } catch (error) {
    next(error);
  }
}

export async function getTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const templates = await templateService.getTemplates(userId);

    return res.status(200).json(new ApiResponse(200, templates, "Templates fetched"));
  } catch (error) {
    next(error);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { templateId } = templateIdSchema.parse(req.params);
    const data = updateTemplateSchema.parse(req.body);
    const template = await templateService.updateTemplate(templateId, userId, data);

    return res.status(200).json(new ApiResponse(200, template, "Template updated"));
  } catch (error) {
    next(error);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { templateId } = deleteTemplateSchema.parse(req.params);
    await templateService.deleteTemplate(templateId, userId);

    return res.status(200).json(new ApiResponse(200, null, "Template deleted"));
  } catch (error) {
    next(error);
  }
}

export async function useTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const { templateId } = templateIdSchema.parse(req.params);
    const data = useTemplateSchema.parse(req.body);
    const plan = await templateService.useTemplate(templateId, userId, data);

    return res.status(201).json(new ApiResponse(201, plan, "Plan created from template"));
  } catch (error) {
    next(error);
  }
}
