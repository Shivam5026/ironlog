export type CreateWorkoutDayInput = {
  workoutPlanId: string;
  name: string;
  order?: number;
};

export type UpdateWorkoutDayInput = {
  name: string;
};

export type ReorderWorkoutDaysInput = {
  workoutPlanId: string;
  days: { id: string; order: number }[];
};
