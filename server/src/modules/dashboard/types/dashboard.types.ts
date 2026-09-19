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

export interface DashboardResponse {
  todayWorkout: DashboardTodayWorkout | null;
  streak: DashboardStreak;
  weeklyProgress: DashboardWeeklyProgress;
  totalWorkouts: number;
  currentBodyWeight: DashboardCurrentWeight | null;
  totalVolume: number;
  lastWorkout: DashboardLastWorkout | null;
}