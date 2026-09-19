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
  bestVolume: number;
  estimatedOneRepMax: number;
  achievedAt: string;
};

export type PersonalRecordMetric = "WEIGHT" | "VOLUME" | "ONE_REP_MAX";

export type NewPersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  type: PersonalRecordMetric;
  value: number;
  previousValue: number;
};

export type ExerciseHistoryEntry = {
  workoutSessionId: string;
  startedAt: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  totalSets: number;
};
