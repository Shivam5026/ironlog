export interface DashboardTodayWorkout {
  planId: string;
  planName: string;
  dayId: string;
  dayName: string;
  exerciseCount: number;
}

export interface DashboardStreak {
  current: number;
  longest: number;
}

export interface DashboardWeeklyProgress {
  completedWorkouts: number;
  targetWorkouts: number;
}

export interface DashboardCurrentWeight {
  weight: number;
  recordedAt: string;
}

export interface DashboardLastWorkout {
  id: string;
  planName: string;
  dayName: string;
  completedAt: string;
  duration: number | null;
  totalVolume: number;
}

export interface DashboardData {
  todayWorkout: DashboardTodayWorkout | null;
  streak: DashboardStreak;
  weeklyProgress: DashboardWeeklyProgress;
  totalWorkouts: number;
  currentBodyWeight: DashboardCurrentWeight | null;
  totalVolume: number;
  lastWorkout: DashboardLastWorkout | null;
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