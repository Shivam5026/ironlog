export interface PreviousPerformance {
  exerciseId: string;
  bestWeight: number;
  bestReps: number;
  lastWeight: number;
  lastReps: number;
  estimatedOneRepMax: number | null;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  lastPerformedAt: Date;
  estimatedOneRepMax: number | null;
  workoutSessionId: string | null;
}

export interface ExerciseHistoryEntry {
  workoutSessionId: string;
  startedAt: Date;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  totalSets: number;
}