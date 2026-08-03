export type CreateWorkoutExerciseInput = {
  workoutDayId: string;
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;
};

export type UpdateWorkoutExerciseInput = {
  sets?: number;
  reps?: number;
  restTime?: number;
  notes?: string;
};

export type ReplaceWorkoutExerciseInput = {
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
};

export type ReorderWorkoutExercisesInput = {
  workoutDayId: string;
  exercises: { id: string; order: number }[];
};
