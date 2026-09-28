/**
 * Report Export Utilities
 *
 * CSV helpers for normalizing report data into exportable formats.
 * These utilities are used by the export service to convert
 * report sections into CSV-compatible strings.
 */

// ── CSV Helpers ────────────────────────────────────────────────────

/**
 * Escape a value for CSV (wrap in quotes if needed).
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string.
 * Uses the keys of the first object as headers.
 */
export function arrayToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCsvValue).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvValue(row[h])).join(","),
  );
  return [headerLine, ...dataLines].join("\n");
}

/**
 * Convert key-value pairs to CSV (2-column: Metric, Value).
 */
export function keyValueToCsv(pairs: [string, unknown][]): string {
  return arrayToCsv(
    pairs.map(([metric, value]) => ({ Metric: metric, Value: value })),
  );
}

// ── Report Section Builders ────────────────────────────────────────

import type { WeeklyReport, MonthlyReport, ReportSection } from "../types/report.types";

/**
 * Build exportable sections from a WeeklyReport.
 */
export function buildWeeklySections(report: WeeklyReport): ReportSection[] {
  const sections: ReportSection[] = [];

  // Summary section
  sections.push({
    title: "Workout Summary",
    data: [
      { Metric: "Total Workouts", Value: report.summary.totalWorkouts },
      { Metric: "Total Volume", Value: report.summary.totalVolume },
      { Metric: "Average Duration (min)", Value: report.summary.averageDuration },
    ],
  });

  // Muscle distribution
  if (report.muscleDistribution.length > 0) {
    sections.push({
      title: "Muscle Distribution",
      data: report.muscleDistribution.map((m) => ({
        Muscle: m.muscle,
        Frequency: m.frequency,
      })),
    });
  }

  // Personal records
  if (report.personalRecords.length > 0) {
    sections.push({
      title: "Personal Records",
      data: report.personalRecords.map((pr) => ({
        Exercise: pr.exerciseName,
        "Best Weight (kg)": pr.bestWeight,
        Date: pr.achievedAt,
      })),
    });
  }

  return sections;
}

/**
 * Build exportable sections from a MonthlyReport.
 */
export function buildMonthlySections(report: MonthlyReport): ReportSection[] {
  const sections: ReportSection[] = [];

  // Workout frequency
  sections.push({
    title: "Workout Frequency",
    data: [
      { Metric: "Total Workouts", Value: report.workoutFrequency.totalWorkouts },
      { Metric: "Average Per Week", Value: report.workoutFrequency.averagePerWeek },
    ],
  });

  // Best performing exercises
  if (report.bestPerformingExercises.length > 0) {
    sections.push({
      title: "Best-Performing Exercises",
      data: report.bestPerformingExercises.map((ex) => ({
        Exercise: ex.exerciseName,
        "Best Weight (kg)": ex.bestWeight,
        "Best Volume": ex.bestVolume,
        "Estimated 1RM": ex.estimatedOneRepMax,
      })),
    });
  }

  // Body weight trend
  if (report.bodyWeightTrend.data.length > 0) {
    sections.push({
      title: "Body Weight Trend",
      data: [
        { Metric: "Start Weight (kg)", Value: report.bodyWeightTrend.startWeight },
        { Metric: "End Weight (kg)", Value: report.bodyWeightTrend.endWeight },
        { Metric: "Change (kg)", Value: report.bodyWeightTrend.change },
      ],
    });
  }

  // Overall progress
  sections.push({
    title: "Overall Progress",
    data: [
      { Metric: "Total Volume", Value: report.overallProgress.totalVolume },
      { Metric: "Volume Change (%)", Value: report.overallProgress.volumeChange },
      { Metric: "Total Workouts", Value: report.overallProgress.totalWorkouts },
      { Metric: "Average Duration (min)", Value: report.overallProgress.averageWorkoutDuration },
    ],
  });

  return sections;
}
