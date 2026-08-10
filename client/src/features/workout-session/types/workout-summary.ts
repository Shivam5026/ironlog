export type WorkoutSummaryExercise = {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;
  completedSets: number;
};

export type PersonalRecordEntry = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  previousBestWeight: number;
  previousBestReps: number;
};

export type WorkoutSummary = {
  sessionId: string;
  duration: number;
  totalExercises: number;
  completedExercises: number;
  totalSets: number;
  completedSets: number;
  totalReps: number;
  totalVolume: number;
  personalRecords: PersonalRecordEntry[];
  estimatedCalories: number;
  startedAt: string;
  endedAt: string;
  exercises: WorkoutSummaryExercise[];
};
