import { volumeService } from "./volume.service";
import { frequencyService } from "./frequency.service";
import { exerciseDistributionService } from "./exerciseDistribution.service";
import { muscleDistributionService } from "./muscleDistribution.service";
import { statisticsService } from "./statistics.service";

async function getVolumeAnalytics(userId: string, range: "7d" | "30d" | "all") {
  return volumeService.getVolumeAnalytics(userId, range);
}

async function getWorkoutFrequency(userId: string, range: "7d" | "30d" | "all") {
  return frequencyService.getWorkoutFrequency(userId, range);
}

async function getExerciseDistribution(userId: string, range: "7d" | "30d" | "all") {
  return exerciseDistributionService.getExerciseDistribution(userId, range);
}

async function getMuscleDistribution(userId: string, range: "7d" | "30d" | "all") {
  return muscleDistributionService.getMuscleDistribution(userId, range);
}

async function getStatistics(userId: string) {
  return statisticsService.getStatistics(userId);
}

export const analyticsService = {
  getStatistics,
  getVolumeAnalytics,
  getWorkoutFrequency,
  getExerciseDistribution,
  getMuscleDistribution,
};
