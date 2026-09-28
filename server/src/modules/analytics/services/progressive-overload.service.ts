import { AnalyticsRepository } from "../repositories/analytics.repository";
import { calculateEstimatedOneRepMax } from "../utils/oneRepMax";
import type {
  AnalyticsDateRange,
  AnalyticsRange,
  OverloadMetric,
  ExerciseOverloadAnalysis,
  OverloadDetectionResponse,
  PlateauStatus,
  PlateauAnalysis,
  PlateauDetectionResponse,
} from "../types/analytics.types";

const MS_PER_DAY = 86_400_000;

function rangeToDateRange(range: AnalyticsRange): AnalyticsDateRange {
  if (range === "all") return {};
  const days = range === "7d" ? 7 : 30;
  return { startDate: new Date(Date.now() - days * MS_PER_DAY) };
}

function toDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const PLATEAU_THRESHOLD = 3;

function classifyPlateau(
  consecutiveDecline: number,
  currentConsecutiveNonImproving: number,
  totalPerformances: number,
  hasHadImprovement: boolean,
): PlateauStatus {
  // Priority: DECLINING > STAGNANT > MISSED_PROGRESSION > PROGRESSING

  // DECLINING: strong current downward trend
  if (currentConsecutiveNonImproving >= PLATEAU_THRESHOLD && consecutiveDecline >= PLATEAU_THRESHOLD) {
    return "DECLINING";
  }

  // STAGNANT: long current streak without improvement
  if (currentConsecutiveNonImproving >= PLATEAU_THRESHOLD) {
    return "STAGNANT";
  }

  // MISSED_PROGRESSION: had improvement in the past, but currently stuck
  // with a moderate non-improving streak and enough data
  if (
    hasHadImprovement &&
    currentConsecutiveNonImproving >= 2 &&
    totalPerformances >= PLATEAU_THRESHOLD + 1 &&
    consecutiveDecline === 0
  ) {
    return "MISSED_PROGRESSION";
  }

  return "PROGRESSING";
}

interface SessionPerf {
  sessionId: string;
  endedAt: Date;
  bestWeight: number;
  totalReps: number;
  totalVolume: number;
  bestOneRepMax: number;
  exerciseName: string;
}

function computeSessionPerf(logs: {
  exerciseId: string;
  exerciseName: string;
  workoutSession: { id: string; endedAt: Date | null };
  sets: { weight: unknown; reps: number }[];
}[]): Map<string, SessionPerf> {
  const sessionMap = new Map<string, SessionPerf>();

  for (const log of logs) {
    const sid = log.workoutSession.id;
    const endedAt = log.workoutSession.endedAt;
    if (!endedAt) continue;

    let bestWeight = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let bestOneRepMax = 0;

    for (const set of log.sets) {
      const weight = Number(set.weight);
      const reps = set.reps;

      bestWeight = Math.max(bestWeight, weight);
      totalReps += reps;
      totalVolume += weight * reps;

      const e1rm = calculateEstimatedOneRepMax(weight, reps);
      if (e1rm !== null && e1rm > bestOneRepMax) {
        bestOneRepMax = e1rm;
      }
    }

    const existing = sessionMap.get(sid);
    if (existing) {
      existing.bestWeight = Math.max(existing.bestWeight, bestWeight);
      existing.totalReps += totalReps;
      existing.totalVolume += totalVolume;
      if (bestOneRepMax > existing.bestOneRepMax) {
        existing.bestOneRepMax = bestOneRepMax;
      }
    } else {
      sessionMap.set(sid, {
        sessionId: sid,
        endedAt,
        bestWeight,
        totalReps,
        totalVolume,
        bestOneRepMax,
        exerciseName: log.exerciseName,
      });
    }
  }

  return sessionMap;
}

function compareMetric(
  current: number | null,
  previous: number | null,
): OverloadMetric {
  if (current === null || previous === null) {
    return {
      previous,
      current,
      change: null,
      improved: false,
    };
  }
  const change = Math.round((current - previous) * 100) / 100;
  return {
    previous,
    current,
    change,
    improved: current > previous,
  };
}

export class ProgressiveOverloadService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getOverloadDetection(
    userId: string,
    range: AnalyticsRange = "all",
  ): Promise<OverloadDetectionResponse> {
    const dateRange = rangeToDateRange(range);

    // Fetch all exercise logs with sets for the user
    const allLogs = await this.repository.getAllExerciseLogsWithSets(
      userId,
      dateRange,
    );

    // Group by exerciseId
    const exerciseLogs = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const existing = exerciseLogs.get(log.exerciseId);
      if (existing) {
        existing.push(log);
      } else {
        exerciseLogs.set(log.exerciseId, [log]);
      }
    }

    const exercises: ExerciseOverloadAnalysis[] = [];

    for (const [exerciseId, logsForExercise] of exerciseLogs) {
      const sessionPerfs = computeSessionPerf(logsForExercise);
      const sortedSessions = Array.from(sessionPerfs.values())
        .sort((a, b) => a.endedAt.getTime() - b.endedAt.getTime());

      if (sortedSessions.length === 0) continue;

      const exerciseName = sortedSessions[0].exerciseName;
      const current = sortedSessions[sortedSessions.length - 1];
      const previous =
        sortedSessions.length >= 2
          ? sortedSessions[sortedSessions.length - 2]
          : null;

      const weight = compareMetric(
        current.bestWeight,
        previous?.bestWeight ?? null,
      );
      const reps = compareMetric(
        current.totalReps,
        previous?.totalReps ?? null,
      );
      const volume = compareMetric(
        current.totalVolume,
        previous?.totalVolume ?? null,
      );
      const estimatedOneRepMax = compareMetric(
        current.bestOneRepMax,
        previous?.bestOneRepMax ?? null,
      );

      exercises.push({
        exerciseId,
        exerciseName,
        weight,
        reps,
        volume,
        estimatedOneRepMax,
        overloaded:
          weight.improved ||
          reps.improved ||
          volume.improved ||
          estimatedOneRepMax.improved,
      });
    }

    // Sort by most recently overloaded first
    exercises.sort((a, b) => {
      if (a.overloaded && !b.overloaded) return -1;
      if (!a.overloaded && b.overloaded) return 1;
      return 0;
    });

    return { exercises };
  }

  // ── Plateau Detection (Feature 4.3) ─────────────────────────────

  async detectPlateaus(
    userId: string,
    range: AnalyticsRange = "all",
  ): Promise<PlateauDetectionResponse> {
    const dateRange = rangeToDateRange(range);

    const allLogs = await this.repository.getAllExerciseLogsWithSets(
      userId,
      dateRange,
    );

    // Group by exerciseId
    const exerciseLogs = new Map<string, typeof allLogs>();
    for (const log of allLogs) {
      const existing = exerciseLogs.get(log.exerciseId);
      if (existing) {
        existing.push(log);
      } else {
        exerciseLogs.set(log.exerciseId, [log]);
      }
    }

    const exercises: PlateauAnalysis[] = [];

    for (const [exerciseId, logsForExercise] of exerciseLogs) {
      const sessionPerfs = computeSessionPerf(logsForExercise);
      const sortedSessions = Array.from(sessionPerfs.values())
        .sort((a, b) => a.endedAt.getTime() - b.endedAt.getTime());

      if (sortedSessions.length < 2) {
        exercises.push({
          exerciseId,
          exerciseName: sortedSessions[0]?.exerciseName ?? exerciseId,
          status: "PROGRESSING",
          recentPerformances: sortedSessions.length,
          consecutiveNonImproving: 0,
          lastImprovementDate: null,
        });
        continue;
      }

      const exerciseName = sortedSessions[0].exerciseName;
      let lastImprovementDate: string | null = null;
      let lastImprovementIdx = -1;

      // Walk forwards to find all improvements and the last improvement position
      for (let i = 1; i < sortedSessions.length; i++) {
        const current = sortedSessions[i];
        const previous = sortedSessions[i - 1];

        const improved =
          current.bestWeight > previous.bestWeight ||
          current.totalReps > previous.totalReps ||
          current.totalVolume > previous.totalVolume ||
          current.bestOneRepMax > previous.bestOneRepMax;

        if (improved) {
          lastImprovementDate = toDateKey(current.endedAt);
          lastImprovementIdx = i;
        }
      }

      // Current streak: non-improving transitions after the last improvement
      let consecutiveNonImproving = 0;
      let consecutiveDecline = 0;
      const streakStart = Math.max(lastImprovementIdx + 1, 1);
      for (let i = streakStart; i < sortedSessions.length; i++) {
        const current = sortedSessions[i];
        const previous = sortedSessions[i - 1];

        consecutiveNonImproving += 1;

        const declined =
          current.bestWeight < previous.bestWeight &&
          current.totalReps < previous.totalReps &&
          current.totalVolume < previous.totalVolume &&
          current.bestOneRepMax < previous.bestOneRepMax;

        if (declined) {
          consecutiveDecline += 1;
        }
      }

      const status = classifyPlateau(
        consecutiveDecline,
        consecutiveNonImproving,
        sortedSessions.length,
        lastImprovementDate !== null,
      );

      exercises.push({
        exerciseId,
        exerciseName,
        status,
        recentPerformances: sortedSessions.length,
        consecutiveNonImproving,
        lastImprovementDate,
      });
    }

    // Sort: DECLINING first, then STAGNANT, then MISSED_PROGRESSION, then PROGRESSING
    const statusOrder: Record<PlateauStatus, number> = {
      DECLINING: 0,
      STAGNANT: 1,
      MISSED_PROGRESSION: 2,
      PROGRESSING: 3,
    };
    exercises.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return { exercises };
  }
}
