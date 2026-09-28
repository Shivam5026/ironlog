import type { PrismaClient } from "../../../generated/prisma/client";
import type { AnalyticsDateRange } from "../types/analytics.types";

const MS_PER_DAY = 86_400_000;

// ── Date-range helpers ──────────────────────────────────────────────

function toStartDate(range: AnalyticsDateRange): Date | undefined {
  return range.startDate;
}

function toEndDate(range: AnalyticsDateRange): Date | undefined {
  return range.endDate;
}

function dateFilter(range?: AnalyticsDateRange, field: string = "endedAt") {
  if (!range) return {};
  const gte = toStartDate(range);
  const lte = toEndDate(range);
  if (!gte && !lte) return {};
  return {
    [field]: {
      ...(gte && { gte }),
      ...(lte && { lte }),
    },
  };
}

// ── Repository ──────────────────────────────────────────────────────

export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ── Workout Sessions ────────────────────────────────────────────

  async getCompletedSessions(
    userId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: {
        id: true,
        workoutPlanId: true,
        workoutDayId: true,
        startedAt: true,
        endedAt: true,
        duration: true,
        totalVolume: true,
      },
      orderBy: { endedAt: "asc" },
    });
  }

  async getCompletedSessionIds(
    userId: string,
    range?: AnalyticsDateRange,
  ): Promise<string[]> {
    const sessions = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: { id: true },
    });
    return sessions.map((s) => s.id);
  }

  async getCompletedSessionCount(
    userId: string,
    range?: AnalyticsDateRange,
  ): Promise<number> {
    return this.prisma.workoutSession.count({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
    });
  }

  // ── Exercise Logs ───────────────────────────────────────────────

  async getExerciseLogs(
    userId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.exerciseLog.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: {
        id: true,
        exerciseId: true,
        exerciseName: true,
        exerciseOrder: true,
        workoutSessionId: true,
        notes: true,
      },
    });
  }

  async getExerciseLogsBySessionIds(sessionIds: string[]) {
    if (sessionIds.length === 0) return [];

    return this.prisma.exerciseLog.findMany({
      where: { workoutSessionId: { in: sessionIds } },
      select: {
        exerciseId: true,
        exerciseName: true,
        workoutSessionId: true,
      },
    });
  }

  async getExerciseLogExerciseIds(
    userId: string,
    range?: AnalyticsDateRange,
  ): Promise<string[]> {
    const logs = await this.prisma.exerciseLog.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: { exerciseId: true },
    });

    return [...new Set(logs.map((l) => l.exerciseId))];
  }

  // ── Exercise Log Sets ───────────────────────────────────────────

  async getExerciseLogSets(
    userId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.exerciseLogSet.findMany({
      where: {
        completed: true,
        exerciseLog: {
          workoutSession: {
            userId,
            status: "COMPLETED",
            ...dateFilter(range),
          },
        },
      },
      select: {
        id: true,
        exerciseLogId: true,
        setNumber: true,
        weight: true,
        reps: true,
        completed: true,
        setType: true,
        rpe: true,
        rir: true,
        tempo: true,
      },
    });
  }

  async getCompletedSetsBySessionIds(sessionIds: string[]) {
    if (sessionIds.length === 0) return [];

    return this.prisma.exerciseLogSet.findMany({
      where: {
        completed: true,
        exerciseLog: { workoutSessionId: { in: sessionIds } },
      },
      select: { weight: true, reps: true },
    });
  }

  // ── Volume Data ──────────────────────────────────────────────────

  async getVolumeData(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: {
        id: true,
        endedAt: true,
        exerciseLogs: {
          select: {
            exerciseId: true,
            exerciseName: true,
            sets: {
              where: { completed: true },
              select: { weight: true, reps: true },
            },
          },
        },
      },
      orderBy: { endedAt: "asc" },
    });
  }

  // ── Exercise Volume Data (Feature 2.2) ──────────────────────────

  async getExerciseVolumeData(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.exerciseLog.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: {
        exerciseId: true,
        exerciseName: true,
        workoutSession: {
          select: {
            id: true,
            endedAt: true,
          },
        },
        sets: {
          where: { completed: true },
          select: { weight: true, reps: true },
        },
      },
    });
  }

  // ── Exercise Progress Data (Feature 3.3) ───────────────────────

  async getExerciseProgressData(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.exerciseLog.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: {
        exerciseId: true,
        exerciseName: true,
        workoutSession: {
          select: { id: true },
        },
        sets: {
          where: { completed: true },
          select: { weight: true, reps: true },
        },
      },
    });
  }

  // ── Volume Comparison Data (Feature 4.1) ───────────────────────

  async getExerciseLogsForExercise(
    userId: string,
    exerciseId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.exerciseLog.findMany({
      where: {
        exerciseId,
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: {
        exerciseId: true,
        exerciseName: true,
        workoutSession: {
          select: {
            id: true,
            endedAt: true,
          },
        },
        sets: {
          where: { completed: true },
          select: { weight: true, reps: true },
        },
      },
      orderBy: { workoutSession: { endedAt: "asc" } },
    });
  }

  async getWorkoutSessionById(sessionId: string, userId: string) {
    return this.prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        userId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        endedAt: true,
      },
    });
  }

  // ── All Exercise Logs (Feature 4.2) ─────────────────────────────

  async getAllExerciseLogsWithSets(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.exerciseLog.findMany({
      where: {
        workoutSession: {
          userId,
          status: "COMPLETED",
          ...dateFilter(range),
        },
      },
      select: {
        exerciseId: true,
        exerciseName: true,
        workoutSession: {
          select: {
            id: true,
            endedAt: true,
          },
        },
        sets: {
          where: { completed: true },
          select: { weight: true, reps: true },
        },
      },
      orderBy: { workoutSession: { endedAt: "asc" } },
    });
  }

  // ── Body Weights ────────────────────────────────────────────────

  async getBodyWeights(
    userId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.bodyWeight.findMany({
      where: {
        userId,
        ...dateFilter(range, "recordedAt"),
      },
      select: {
        id: true,
        weight: true,
        recordedAt: true,
      },
      orderBy: { recordedAt: "asc" },
    });
  }

  // ── Muscle Frequency Data (Feature 5.1) ─────────────────────────

  async getSessionsWithExercises(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: {
        id: true,
        endedAt: true,
        exerciseLogs: {
          select: {
            exerciseId: true,
            exerciseName: true,
          },
        },
      },
      orderBy: { endedAt: "asc" },
    });
  }

  // ── Personal Records ────────────────────────────────────────────

  async getPersonalRecords(
    userId: string,
    range?: AnalyticsDateRange,
  ) {
    return this.prisma.personalRecord.findMany({
      where: {
        userId,
        ...dateFilter(range),
      },
      select: {
        id: true,
        exerciseId: true,
        exerciseName: true,
        bestWeight: true,
        bestVolume: true,
        estimatedOneRepMax: true,
        achievedAt: true,
      },
      orderBy: { achievedAt: "asc" },
    });
  }

  // ── Consistency — Workout Frequency (Feature 6.1) ───────────────

  async getCompletedSessionDates(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: {
        endedAt: true,
      },
      orderBy: { endedAt: "asc" },
    });
  }

  // ── Consistency — Duration Analysis (Feature 6.3) ───────────────

  async getCompletedSessionDurations(userId: string, range?: AnalyticsDateRange) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        status: "COMPLETED",
        ...dateFilter(range),
      },
      select: {
        duration: true,
      },
    });
  }
}
