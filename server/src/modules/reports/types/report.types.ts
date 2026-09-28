// ── Weekly Report (Feature 7.1) ───────────────────────────────────

export interface ReportPeriod {
  start: string;
  end: string;
}

export interface ReportSummary {
  totalWorkouts: number;
  totalVolume: number;
  averageDuration: number;
}

export interface ReportMuscleDistribution {
  muscle: string;
  frequency: number;
}

export interface ReportPersonalRecord {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  achievedAt: string;
}

export interface WeeklyReport {
  period: ReportPeriod;
  summary: ReportSummary;
  muscleDistribution: ReportMuscleDistribution[];
  personalRecords: ReportPersonalRecord[];
}

// ── Monthly Report (Feature 7.2) ──────────────────────────────────

export interface MonthlyWorkoutFrequency {
  totalWorkouts: number;
  averagePerWeek: number;
}

export interface BestPerformingExercise {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  estimatedOneRepMax: number;
}

export interface BodyWeightDataPoint {
  date: string;
  weight: number;
}

export interface BodyWeightTrend {
  startWeight: number;
  endWeight: number;
  change: number;
  data: BodyWeightDataPoint[];
}

export interface OverallProgress {
  totalVolume: number;
  volumeChange: number;
  totalWorkouts: number;
  averageWorkoutDuration: number;
}

export interface MonthlyReport {
  period: ReportPeriod;
  workoutFrequency: MonthlyWorkoutFrequency;
  bestPerformingExercises: BestPerformingExercise[];
  bodyWeightTrend: BodyWeightTrend;
  overallProgress: OverallProgress;
}

// ── Report Export (Feature 7.3) ───────────────────────────────────

export type ReportFormat = "pdf" | "csv";

export type ReportType = "weekly" | "monthly";

export interface ReportMetadata {
  type: ReportType;
  startDate: string;
  endDate: string;
  generatedAt: string;
}

export interface ReportSection {
  title: string;
  data: unknown;
}

export interface ReportExportPayload {
  metadata: ReportMetadata;
  sections: ReportSection[];
}

export interface ExportResult {
  content: string;
  mimeType: string;
  extension: string;
}
