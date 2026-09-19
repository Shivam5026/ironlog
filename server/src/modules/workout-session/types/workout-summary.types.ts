import type { NewPersonalRecord } from "../../personal-record/types/personal-record.types";

export interface WorkoutSummaryExercise {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  completedSets: number;
}

export interface PersonalRecordEntry {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  previousBestWeight: number;
  previousBestReps: number;
}

export interface WorkoutSummary {
  sessionId: string;
  duration: number;
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  totalReps: number;
  totalVolume: number;
  personalRecords: PersonalRecordEntry[];
  newPRs: NewPersonalRecord[];
  estimatedCalories: number;
  startedAt: Date;
  endedAt: Date;
  exercises: WorkoutSummaryExercise[];
}
