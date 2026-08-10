export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  exercise?: string;
  plan?: string;
}

export interface WorkoutHistoryEntry {
  id: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED";
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  totalVolume: number;
  planId: string;
  planName: string;
  exerciseCount: number;
  exerciseNames: string[];
}

export interface WorkoutDetailExerciseSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutDetailExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  notes: string | null;
  sets: WorkoutDetailExerciseSet[];
}

export interface WorkoutDetail {
  id: string;
  status: "active" | "paused" | "completed" | "abandoned";
  startedAt: Date;
  endedAt: Date | null;
  duration: number | null;
  totalVolume: number;
  planId: string;
  planName: string;
  exercises: WorkoutDetailExercise[];
}