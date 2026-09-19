export type WorkoutHistorySort = "newest" | "oldest" | "volume" | "duration";

export interface WorkoutHistoryItem {
  id: string;
  workoutPlanId: string;
  workoutDayId: string;
  planName: string;
  dayName: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  totalVolume: number;
  exerciseCount: number;
}

export interface WorkoutHistoryPage {
  items: WorkoutHistoryItem[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface WorkoutHistoryFilters {
  search?: string;
  sort?: WorkoutHistorySort;
}

export type WorkoutSetType = "WARMUP" | "WORKING" | "FAILURE";

export interface WorkoutHistorySet {
  setNumber: number;
  weight: number;
  reps: number;
  setType: WorkoutSetType;
  isWarmup: boolean;
  isFailure: boolean;
  rpe: number | null;
  rir: number | null;
  tempo: string | null;
  restTime: number;
  completed: boolean;
}

export interface WorkoutHistoryExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  notes: string | null;
  sets: WorkoutHistorySet[];
}

export interface WorkoutHistoryPersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  previousBestWeight: number;
  previousBestReps: number;
}

export interface WorkoutHistoryDetail {
  id: string;
  workoutPlanId: string;
  workoutDayId: string;
  planName: string;
  dayName: string;
  status: "COMPLETED";
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  totalVolume: number;
  exerciseCount: number;
  exercises: WorkoutHistoryExercise[];
  personalRecords: WorkoutHistoryPersonalRecord[];
}

export const WORKOUT_HISTORY_SORTS: {
  value: WorkoutHistorySort;
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "volume", label: "Most volume" },
  { value: "duration", label: "Longest duration" },
];