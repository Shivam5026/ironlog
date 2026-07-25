export interface Exercise {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  targetMuscles: string[];
  equipments: string[];
}

export interface SearchExercisesResponse {
  success: boolean;
  data: Exercise[];
}