export type CreateWorkoutPlanPayload = {
  name: string;
  description?: string;
};

export type WorkoutPlan = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  workoutDays?: unknown[];
};
