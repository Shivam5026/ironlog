export interface TemplateExercise {
  id: string;
  templateDayId: string;
  exerciseId: string;
  exerciseName: string;
  gifUrl?: string | null;
  order: number;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string | null;
}

export interface TemplateDay {
  id: string;
  templateId: string;
  name: string;
  order: number;
  exercises: TemplateExercise[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  days: TemplateDay[];
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  workoutPlanId: string;
}

export interface UseTemplatePayload {
  name: string;
}

export interface UpdateTemplatePayload {
  name: string;
  description?: string;
}
