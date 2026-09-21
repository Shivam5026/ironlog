export type AnalyticsRange = "7d" | "30d" | "all";

// Statistics
export interface Statistics {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number;
  averageWeeklyFrequency: number;
}

// Volume
export interface VolumeChartPoint {
  date: string;
  volume: number;
}

export interface VolumeAnalyticsResponse {
  range: AnalyticsRange;
  data: VolumeChartPoint[];
}

// Frequency
export interface WorkoutFrequencyPoint {
  period: string;
  workouts: number;
}

export interface WorkoutFrequencyResponse {
  range: AnalyticsRange;
  data: WorkoutFrequencyPoint[];
}

// Exercise Distribution
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

// Muscle Distribution
export interface MuscleDistributionItem {
  muscle: string;
  count: number;
}

export interface MuscleDistributionResponse {
  range: AnalyticsRange;
  totalSessions: number;
  data: MuscleDistributionItem[];
}
