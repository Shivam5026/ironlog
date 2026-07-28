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

export interface ExerciseListMeta {
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface ExerciseListResponse {
  meta: ExerciseListMeta;
  data: Exercise[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface ExercisePayload {
  success: boolean;
  data: Exercise;
}

export interface ExerciseListPayload {
  success: boolean;
  meta: ExerciseListMeta;
  data: Exercise[];
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