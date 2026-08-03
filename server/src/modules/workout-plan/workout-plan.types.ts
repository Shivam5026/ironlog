import type { Prisma } from "../../generated/prisma/client";

export type WorkoutPlan = Prisma.WorkoutPlanGetPayload<{
  include: {
    workoutDays: {
      include: {
        exercises: true;
      };
    };
  };
}>;

export type WorkoutDay = Prisma.WorkoutDayGetPayload<{
  include: {
    exercises: true;
  };
}>;

export type WorkoutPlanExercise = Prisma.WorkoutPlanExerciseGetPayload<{}>;

export type CreateWorkoutPlanInput = {
  name: string;
  description?: string;
};

export type UpdateWorkoutPlanInput = {
  name?: string;
  description?: string;
};

export type CreateWorkoutDayInput = {
  name: string;
  order: number;
};
