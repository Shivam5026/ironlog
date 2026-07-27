export interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
  equipments: string[];
  instructions: string[];
}

export interface ExerciseListResponse {
  success: boolean;
  message: string;
  data: {
    meta: {
      total: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextCursor?: string;
      previousCursor?: string;
    };
    data: Exercise[];
  };
}

export interface ExerciseLibraryFilters {
  search: string;
  bodyParts: string;
  targetMuscles: string;
  equipments: string;
  limit: number;
  after?: string;
  before?: string;
}