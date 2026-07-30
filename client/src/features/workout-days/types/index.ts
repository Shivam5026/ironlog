export interface WorkoutDay {
  id: string;
  workoutPlanId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  exercises?: WorkoutDayExercise[];
}

export interface WorkoutDayExercise {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string | null;
  exercise?: { name: string } | null;
}

export interface CreateWorkoutDayPayload {
  workoutPlanId: string;
  name: string;
  order?: number;
}

export interface UpdateWorkoutDayPayload {
  name: string;
}

export interface ReorderWorkoutDaysPayload {
  workoutPlanId: string;
  days: { id: string; order: number }[];
}
