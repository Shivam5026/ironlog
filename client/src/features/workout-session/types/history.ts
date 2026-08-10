export type WorkoutHistoryEntry = {
  id: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED";
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  totalVolume: number;
  planId: string;
  planName: string;
  exerciseCount: number;
  exerciseNames: string[];
};

export type WorkoutDetailSet = {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type WorkoutDetailExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  notes: string | null;
  sets: WorkoutDetailSet[];
};

export type WorkoutDetail = {
  id: string;
  status: "active" | "paused" | "completed" | "abandoned";
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  totalVolume: number;
  planId: string;
  planName: string;
  exercises: WorkoutDetailExercise[];
};

export type WorkoutHistoryFilters = {
  startDate?: string;
  endDate?: string;
  exercise?: string;
  plan?: string;
  search?: string;
};
