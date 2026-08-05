export type WorkoutSessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ABANDONED";

export type WorkoutSessionSet = {
  id: string;
  setNumber: number;
  weight: string;
  reps: number;
  restTime: number;
  completed: boolean;
  setType: "WARMUP" | "WORKING" | "FAILURE";
  isWarmup: boolean;
  isFailure: boolean;
};

export type CreateExerciseLogSetPayload = {
  exerciseLogId: string;
  weight: number;
  reps: number;
  setNumber: number;
  restTime?: number;
  setType?: "WARMUP" | "WORKING" | "FAILURE";
};

export type UpdateExerciseLogSetPayload = {
  weight?: number;
  reps?: number;
  setNumber?: number;
  restTime?: number;
  setType?: "WARMUP" | "WORKING" | "FAILURE";
  isWarmup?: boolean;
  isFailure?: boolean;
};

export type SetPayload = {
  id?: string;
  setNumber: number;
  weight: number;
  reps: number;
  restTime?: number;
  setType?: "WARMUP" | "WORKING" | "FAILURE";
  isWarmup?: boolean;
  isFailure?: boolean;
  completed?: boolean;
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  notes: string | null;
  sets: WorkoutSessionSet[];
};

export type CreateExerciseLogPayload = {
  workoutSessionId: string;
  exerciseId: string;
  exerciseName: string;
  exerciseOrder?: number;
  notes?: string;
  sets: SetPayload[];
};

export type UpdateExerciseLogPayload = {
  notes?: string | null;
  sets?: SetPayload[];
};

export type WorkoutSession = {
  id: string;
  userId: string;
  workoutPlanId: string;
  status: WorkoutSessionStatus;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  totalVolume: string | null;
  workoutPlan: {
    id: string;
    name: string;
    workoutDays: unknown[];
  };
  exerciseLogs: ExerciseLog[];
};
