export interface BodyWeightEntry {
  id: string;
  weight: number;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyWeightList {
  items: BodyWeightEntry[];
}

export interface CreateBodyWeightInput {
  weight: number;
  recordedAt?: Date;
}

export interface UpdateBodyWeightInput {
  weight: number;
  recordedAt?: Date;
}
