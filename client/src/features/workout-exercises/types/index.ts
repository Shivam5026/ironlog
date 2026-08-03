export interface WorkoutPlanExercise {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
  order: number;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutExercisePayload {
  workoutDayId: string;
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
}

export interface ReplaceWorkoutExercisePayload {
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
}

export interface UpdateWorkoutExercisePayload {
  sets?: number;
  reps?: number;
  restTime?: number;
  notes?: string;
}

export interface ReorderWorkoutExercisesPayload {
  workoutDayId: string;
  exercises: { id: string; order: number }[];
}
