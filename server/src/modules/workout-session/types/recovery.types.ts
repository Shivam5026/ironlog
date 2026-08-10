export interface ActiveRecoverySession {
  id: string;
  workoutPlanId: string;
  status: "ACTIVE" | "PAUSED";
  startedAt: Date;
  updatedAt: Date;
}
