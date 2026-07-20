export type Goal =
  | "LOSE_WEIGHT"
  | "MAINTAIN"
  | "GAIN_MUSCLE"
  | "STRENGTH"
  | "ENDURANCE";

export type ExperienceLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

export interface UserProfile {
  id: string;
  userId: string;

  height: number | null;
  weight: number | null;

  goal: Goal | null;
  experience: ExperienceLevel | null;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  height?: number;
  weight?: number;
  goal?: Goal;
  experience?: ExperienceLevel;
}