export type PreviousPerformance = {
  exerciseId: string;
  bestWeight: number;
  bestReps: number;
  lastWeight: number;
  lastReps: number;
  estimatedOneRepMax: number | null;
};

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  estimatedOneRepMax: number | null;
  lastPerformedAt: string;
  workoutSessionId: string | null;
};

export type ExerciseHistoryEntry = {
  workoutSessionId: string;
  startedAt: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  totalSets: number;
};
