export type AnalyticsRange = "7d" | "30d" | "all";

// ── Date range abstraction ──────────────────────────────────────────

export interface AnalyticsDateRange {
  startDate?: Date;
  endDate?: Date;
}

// ── Standardized response wrapper ──────────────────────────────────

export interface AnalyticsMeta {
  range?: AnalyticsRange;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsResponse<T> {
  data: T;
  meta?: AnalyticsMeta;
}

// ── Analytics options ──────────────────────────────────────────────

export interface AnalyticsOptions {
  range?: AnalyticsRange;
  startDate?: Date;
  endDate?: Date;
}

// ── Statistics ─────────────────────────────────────────────────────

export interface Statistics {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number;
  averageWeeklyFrequency: number;
}

// ── Volume (Feature 2.1) ───────────────────────────────────────────

export interface VolumeChartPoint {
  date: string;
  volume: number;
}

export interface VolumeAnalyticsResponse {
  range: AnalyticsRange;
  data: VolumeChartPoint[];
}

export interface WorkoutVolume {
  workoutSessionId: string;
  date: string;
  volume: number;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
}

export interface VolumeAnalytics {
  workout: WorkoutVolume[];
  daily: VolumeDataPoint[];
  weekly: VolumeDataPoint[];
  monthly: VolumeDataPoint[];
}

// ── Frequency ──────────────────────────────────────────────────────

export interface WorkoutFrequencyPoint {
  period: string;
  workouts: number;
}

export interface WorkoutFrequencyResponse {
  range: AnalyticsRange;
  data: WorkoutFrequencyPoint[];
}

// ── Exercise Distribution ──────────────────────────────────────────

export interface ExerciseDistributionItem {
  exerciseId: string;
  exerciseName: string;
  count: number;
}

export interface ExerciseDistributionResponse {
  range: AnalyticsRange;
  totalSessions: number;
  data: ExerciseDistributionItem[];
}

// ── Muscle Distribution ────────────────────────────────────────────

export interface MuscleDistributionItem {
  muscle: string;
  count: number;
}

export interface MuscleDistributionResponse {
  range: AnalyticsRange;
  totalSessions: number;
  data: MuscleDistributionItem[];
}

// ── Exercise Volume (Feature 2.2) ─────────────────────────────────

export interface ExerciseVolumeTrendPoint {
  date: string;
  volume: number;
}

export interface ExerciseVolumeAnalytics {
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
  trend: ExerciseVolumeTrendPoint[];
}

export interface HighestVolumeExercise {
  exerciseId: string;
  exerciseName: string;
  totalVolume: number;
}

export interface ExerciseVolumeResponse {
  exercises: ExerciseVolumeAnalytics[];
  highestVolumeExercises: HighestVolumeExercise[];
}

// ── Muscle Group Volume (Feature 2.3) ─────────────────────────────

export interface MuscleGroupVolumeItem {
  muscleGroup: string;
  volume: number;
}

export type MuscleGroupVolumeResponse = MuscleGroupVolumeItem[];

// ── Progress Trends (Feature 3.1) ─────────────────────────────────

export interface ProgressDataPoint {
  period: string;
  value: number;
}

export interface ExerciseProgressPoint {
  date: string;
  volume: number;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  trend: ExerciseProgressPoint[];
}

export interface ProgressTrends {
  weekly: ProgressDataPoint[];
  monthly: ProgressDataPoint[];
  exercises: ExerciseProgress[];
  bodyWeight: ProgressDataPoint[];
  oneRepMax: ExerciseOneRepMaxTrend[];
}

// ── One Rep Max Trends (Feature 3.2) ──────────────────────────────

export interface OneRepMaxTrendPoint {
  date: string;
  estimatedOneRepMax: number;
}

export interface ExerciseOneRepMaxTrend {
  exerciseId: string;
  exerciseName: string;
  trend: OneRepMaxTrendPoint[];
}

export interface OneRepMaxTrends {
  exercises: ExerciseOneRepMaxTrend[];
}

// ── Exercise Progress Metrics (Feature 3.3) ───────────────────────

export interface ExerciseProgressMetricsItem {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestVolume: number;
  averageReps: number;
  averageWeight: number;
}

export interface ExerciseProgressMetricsResponse {
  exercises: ExerciseProgressMetricsItem[];
}

// ── Volume Comparison (Feature 4.1) ───────────────────────────────

export interface VolumeComparisonPoint {
  volume: number;
  date?: string;
  workoutSessionId?: string;
}

export interface VolumeComparisonResponse {
  exerciseId: string;
  exerciseName: string;
  currentWorkout: VolumeComparisonPoint;
  previousWorkout: VolumeComparisonPoint | null;
  weeklyAverage: number;
}

// ── Overload Detection (Feature 4.2) ─────────────────────────────

export interface OverloadMetric {
  previous: number | null;
  current: number | null;
  change: number | null;
  improved: boolean;
}

export interface ExerciseOverloadAnalysis {
  exerciseId: string;
  exerciseName: string;
  weight: OverloadMetric;
  reps: OverloadMetric;
  volume: OverloadMetric;
  estimatedOneRepMax: OverloadMetric;
  overloaded: boolean;
}

export interface OverloadDetectionResponse {
  exercises: ExerciseOverloadAnalysis[];
}

// ── Plateau Detection (Feature 4.3) ───────────────────────────────

export type PlateauStatus =
  | "PROGRESSING"
  | "STAGNANT"
  | "DECLINING"
  | "MISSED_PROGRESSION";

export interface PlateauAnalysis {
  exerciseId: string;
  exerciseName: string;
  status: PlateauStatus;
  recentPerformances: number;
  consecutiveNonImproving: number;
  lastImprovementDate: string | null;
}

export interface PlateauDetectionResponse {
  exercises: PlateauAnalysis[];
}

// ── Muscle Frequency (Feature 5.1) ────────────────────────────────

export type MuscleFrequencyRange = "weekly" | "monthly";

export interface MuscleFrequencyItem {
  muscle: string;
  frequency: number;
}

export interface MuscleFrequencyResponse {
  range: MuscleFrequencyRange;
  data: MuscleFrequencyItem[];
}

// ── Muscle Balance (Feature 5.2) ──────────────────────────────────

export type MuscleBalanceStatus = "OVERTRAINED" | "BALANCED" | "UNDERTRAINED";

export interface MuscleBalanceItem {
  muscle: string;
  frequency: number;
  status: MuscleBalanceStatus;
}

export interface MuscleBalanceResponse {
  range: MuscleFrequencyRange;
  averageFrequency: number;
  muscles: MuscleBalanceItem[];
}

// ── Training Heatmap (Feature 5.3) ────────────────────────────────

export interface HeatmapDataPoint {
  date: string;
  muscle: string;
  frequency: number;
}

export interface MuscleHeatmapResponse {
  range: MuscleFrequencyRange;
  data: HeatmapDataPoint[];
}

// ── Consistency — Workout Frequency (Feature 6.1) ─────────────────

export type ConsistencyRange = "weekly" | "monthly";

export interface ConsistencyFrequencyDataPoint {
  period: string;
  workouts: number;
}

// ── Consistency — Streak Analysis (Feature 6.2) ───────────────────

export interface StreakAnalysis {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  missedDays: number;
  range: {
    start: string;
    end: string;
  };
}

// ── Consistency — Duration Analysis (Feature 6.3) ─────────────────

export interface DurationAnalysis {
  averageDuration: number;
  longestDuration: number;
  shortestDuration: number;
  totalWorkouts: number;
  unit: "minutes";
}

export interface ConsistencyResponse {
  range: ConsistencyRange;
  frequency: {
    data: ConsistencyFrequencyDataPoint[];
  };
  streak: StreakAnalysis;
  duration: DurationAnalysis;
}
