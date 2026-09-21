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

export interface CreateBodyWeightPayload {
  weight: number;
  recordedAt?: string;
}

export interface UpdateBodyWeightPayload {
  weight: number;
  recordedAt?: string;
}
