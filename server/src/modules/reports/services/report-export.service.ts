/**
 * Report Export Service
 *
 * Future-ready export abstraction for weekly and monthly reports.
 * Converts normalized report data into PDF/CSV formats.
 *
 * Currently implements CSV export. PDF export is a placeholder
 * for future implementation.
 */

import { ApiError } from "../../../utils/ApiError";
import type {
  ReportFormat,
  ReportType,
  WeeklyReport,
  MonthlyReport,
  ReportExportPayload,
  ReportMetadata,
  ReportSection,
  ExportResult,
} from "../types/report.types";
import {
  arrayToCsv,
  buildWeeklySections,
  buildMonthlySections,
} from "../utils/report-export.utils";

// ── Public API ─────────────────────────────────────────────────────

/**
 * Export a weekly report in the specified format.
 */
export async function exportWeeklyReport(
  report: WeeklyReport,
  format: ReportFormat,
): Promise<ExportResult> {
  const payload = normalizeWeeklyReport(report);
  return exportPayload(payload, format);
}

/**
 * Export a monthly report in the specified format.
 */
export async function exportMonthlyReport(
  report: MonthlyReport,
  format: ReportFormat,
): Promise<ExportResult> {
  const payload = normalizeMonthlyReport(report);
  return exportPayload(payload, format);
}

// ── Normalization ──────────────────────────────────────────────────

function normalizeWeeklyReport(report: WeeklyReport): ReportExportPayload {
  const metadata: ReportMetadata = {
    type: "weekly",
    startDate: report.period.start,
    endDate: report.period.end,
    generatedAt: new Date().toISOString(),
  };

  const sections = buildWeeklySections(report);

  return { metadata, sections };
}

function normalizeMonthlyReport(report: MonthlyReport): ReportExportPayload {
  const metadata: ReportMetadata = {
    type: "monthly",
    startDate: report.period.start,
    endDate: report.period.end,
    generatedAt: new Date().toISOString(),
  };

  const sections = buildMonthlySections(report);

  return { metadata, sections };
}

// ── Format Dispatch ────────────────────────────────────────────────

async function exportPayload(
  payload: ReportExportPayload,
  format: ReportFormat,
): Promise<ExportResult> {
  switch (format) {
    case "csv":
      return exportCsv(payload);
    case "pdf":
      return exportPdf(payload);
    default:
      throw new ApiError(400, `Unsupported export format: ${format}`);
  }
}

// ── CSV Export ─────────────────────────────────────────────────────

function exportCsv(payload: ReportExportPayload): ExportResult {
  const lines: string[] = [];

  // Header
  lines.push(`IronLog ${capitalize(payload.metadata.type)} Report`);
  lines.push(`${payload.metadata.startDate} to ${payload.metadata.endDate}`);
  lines.push(`Generated: ${payload.metadata.generatedAt}`);
  lines.push("");

  // Sections
  for (const section of payload.sections) {
    lines.push(`## ${section.title}`);
    if (Array.isArray(section.data) && section.data.length > 0) {
      lines.push(arrayToCsv(section.data as Record<string, unknown>[]));
    }
    lines.push("");
  }

  const content = lines.join("\n");

  return {
    content,
    mimeType: "text/csv",
    extension: "csv",
  };
}

// ── PDF Export (Placeholder) ───────────────────────────────────────

function exportPdf(_payload: ReportExportPayload): ExportResult {
  // Future: integrate a PDF library (e.g., pdfmake, puppeteer, @react-pdf/renderer)
  // For now, return a placeholder that indicates PDF generation is not yet implemented
  throw new ApiError(501, "PDF export is not yet implemented");
}

// ── Helpers ────────────────────────────────────────────────────────

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
