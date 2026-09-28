import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError } from "../../../utils/ApiError";
import { generateWeeklyReport, generateMonthlyReport } from "../services/report-generation.service";
import { exportWeeklyReport, exportMonthlyReport } from "../services/report-export.service";
import type { ReportFormat } from "../types/report.types";

// ── Weekly Report (Feature 7.1) ───────────────────────────────────

async function getWeeklyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const dateParam = req.query.date as string | undefined;
    const referenceDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(referenceDate.getTime())) {
      throw new ApiError(400, "Invalid date parameter");
    }

    const { startDate, endDate } = getWeekBoundaries(referenceDate);
    const report = await generateWeeklyReport(userId, startDate, endDate);

    return res
      .status(200)
      .json(new ApiResponse(200, report, "Weekly report generated"));
  } catch (error) {
    next(error);
  }
}

// ── Monthly Report (Feature 7.2) ──────────────────────────────────

async function getMonthlyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const dateParam = req.query.date as string | undefined;
    const referenceDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(referenceDate.getTime())) {
      throw new ApiError(400, "Invalid date parameter");
    }

    const { startDate, endDate } = getMonthBoundaries(referenceDate);
    const report = await generateMonthlyReport(userId, startDate, endDate);

    return res
      .status(200)
      .json(new ApiResponse(200, report, "Monthly report generated"));
  } catch (error) {
    next(error);
  }
}

// ── Helpers ────────────────────────────────────────────────────────

function getWeekBoundaries(date: Date): { startDate: Date; endDate: Date } {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);

  const startDate = new Date(d);
  const endDate = new Date(d);
  endDate.setUTCDate(endDate.getUTCDate() + 6); // Sunday
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
}

function getMonthBoundaries(date: Date): { startDate: Date; endDate: Date } {
  const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  return { startDate, endDate };
}

function validateFormat(format: string | undefined): ReportFormat {
  if (format === "pdf" || format === "csv") return format;
  throw new ApiError(400, "Invalid format. Supported: pdf, csv");
}

// ── Export Endpoints (Feature 7.3 — future-ready) ─────────────────

async function exportWeekly(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const format = validateFormat(req.query.format as string | undefined);

    const dateParam = req.query.date as string | undefined;
    const referenceDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(referenceDate.getTime())) {
      throw new ApiError(400, "Invalid date parameter");
    }

    const { startDate, endDate } = getWeekBoundaries(referenceDate);
    const report = await generateWeeklyReport(userId, startDate, endDate);
    const result = await exportWeeklyReport(report, format);

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="ironlog-weekly-report.${result.extension}"`);
    return res.status(200).send(result.content);
  } catch (error) {
    next(error);
  }
}

async function exportMonthly(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const format = validateFormat(req.query.format as string | undefined);

    const dateParam = req.query.date as string | undefined;
    const referenceDate = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(referenceDate.getTime())) {
      throw new ApiError(400, "Invalid date parameter");
    }

    const { startDate, endDate } = getMonthBoundaries(referenceDate);
    const report = await generateMonthlyReport(userId, startDate, endDate);
    const result = await exportMonthlyReport(report, format);

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="ironlog-monthly-report.${result.extension}"`);
    return res.status(200).send(result.content);
  } catch (error) {
    next(error);
  }
}

export const reportsController = {
  getWeeklyReport,
  getMonthlyReport,
  exportWeekly,
  exportMonthly,
};
