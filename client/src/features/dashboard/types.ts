export interface DashboardStats {
  plans: number;
  templates: number;
  days: number;
  exercises: number;
  weeklyWorkouts: number;
  streak: number;
}

export interface RecentPlan {
  id: string;
  name: string;
  updatedAt: string;
}

export interface RecentTemplate {
  id: string;
  name: string;
  updatedAt: string;
}
