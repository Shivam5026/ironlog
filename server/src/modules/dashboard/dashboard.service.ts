import { prisma } from "../../config/prisma";

async function getDashboardStats(userId: string) {
  const [plans, templates, days, exercises] = await Promise.all([
    prisma.workoutPlan.count({ where: { userId } }),
    prisma.workoutTemplate.count({ where: { userId } }),
    prisma.workoutDay.count({ where: { workoutPlan: { userId } } }),
    prisma.workoutPlanExercise.count({ where: { workoutDay: { workoutPlan: { userId } } } }),
  ]);

  return {
    plans,
    templates,
    days,
    exercises,
    // ponytail: no session/workout-log model yet — hard 0s until WorkoutSession lands.
    weeklyWorkouts: 0,
    streak: 0,
  };
}

async function getRecentPlans(userId: string) {
  return prisma.workoutPlan.findMany({
    where: { userId },
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
}

async function getRecentTemplates(userId: string) {
  return prisma.workoutTemplate.findMany({
    where: { userId },
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });
}

export const dashboardService = {
  getDashboardStats,
  getRecentPlans,
  getRecentTemplates,
};
