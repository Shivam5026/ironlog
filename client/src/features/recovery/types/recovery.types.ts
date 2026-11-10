// ── Muscle Recovery (GET /api/recovery) ────────────────────────────

export const RECOVERY_STATUSES = [
  "NOT_READY",
  "RECOVERING",
  "NEARLY_READY",
  "FULLY_RECOVERED",
] as const;

export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

/** Per-muscle recovery reading from the Epic 2-3 recovery engine. */
export interface MuscleRecovery {
  muscle: string;
  /** Estimated fatigue on the 0-100 score range. */
  fatigueScore: number;
  /** Recovery percentage 0-100, inverse of fatigue. */
  recoveryPercentage: number;
  status: RecoveryStatus;
  /** ISO timestamp of the most recent completed set, or null if untrained. */
  lastTrainedAt: string | null;
}

export interface RecoverySummary {
  muscles: MuscleRecovery[];
  calculatedAt: string;
}

/**
 * A normalized muscle group for the six-group recovery grid (Feature 6.2).
 * The backend reports the underlying 11 muscle groups; these rows aggregate
 * them into the roadmap's six display groups (Chest, Back, Legs, Shoulders,
 * Arms, Core).
 */
export interface MuscleRecoveryItem {
  muscle: string;
  recoveryPercentage: number;
  status: RecoveryStatus;
  /** Most recent training timestamp across the group, or null if untrained. */
  lastTrainedAt: string | null;
  /** The underlying muscle readings backing this display group. */
  components: MuscleRecovery[];
}

// ── Recovery Timeline (GET /api/recovery/timeline) — Feature 6.3 ───

/**
 * Per-muscle timeline entry from the recovery engine. The percentage is the
 * same value the recovery summary reports; the estimate is null whenever a
 * reliable one cannot be produced (untrained muscle).
 */
export interface RecoveryTimelineItem {
  muscle: string;
  /** ISO timestamp of the most recent completed workout, or null if untrained. */
  lastTrainedAt: string | null;
  recoveryPercentage: number;
  /** ISO timestamp recovery reaches 100%, or null when unavailable. */
  estimatedFullRecoveryAt: string | null;
  /** Whole hours until full recovery (0 = recovered), or null when unavailable. */
  estimatedHoursRemaining: number | null;
}

/**
 * A timeline row normalized into one of the six roadmap display groups, so the
 * timeline matches the muscle recovery grid. Recovery is the group minimum
 * (Feature 6.2 rule); the estimate is when the last of its members recovers.
 */
export interface RecoveryTimelineGroupItem {
  muscle: string;
  recoveryPercentage: number;
  status: RecoveryStatus;
  lastTrainedAt: string | null;
  estimatedFullRecoveryAt: string | null;
  estimatedHoursRemaining: number | null;
  components: RecoveryTimelineItem[];
}

// ── Readiness (GET /api/recovery/readiness — Feature 8.1) ──────────

export type ReadinessLevel = "LOW" | "MODERATE" | "HIGH";

/** Normalized 0-100 contribution of each readiness factor. */
export interface ReadinessFactors {
  muscleRecovery: number;
  workoutFrequency: number;
  consecutiveTrainingDays: number;
  workoutDurationTrend: number;
}

/**
 * The standalone readiness response. The same score and level are also
 * embedded in today's recommendation, but this endpoint additionally exposes
 * the per-factor breakdown.
 */
export interface DailyReadiness {
  score: number;
  level: ReadinessLevel;
  factors: ReadinessFactors;
  calculatedAt: string;
}

// ── Today's Recommendation (GET /api/recovery/recommendations) ─────

export type WorkoutRecommendationType =
  | "TRAIN_PUSH"
  | "TRAIN_PULL"
  | "TRAIN_LEGS"
  | "ACTIVE_RECOVERY"
  | "REST_DAY";

export interface TodayRecommendation {
  type: WorkoutRecommendationType;
  title: string;
  reason: string;
  readinessScore: number;
  readinessLevel: ReadinessLevel;
  targetMuscles: string[];
  generatedAt: string;
}

// ── Overall fatigue (derived from recovery muscle readings) ────────

export type FatigueLevel = "LOW" | "MODERATE" | "HIGH";

export interface OverallFatigue {
  level: FatigueLevel;
  /** Average fatigue score across trained muscles (0-100). */
  average: number;
  /** Muscles with an active fatigue reading (> 0). */
  trainedCount: number;
}

// ── Recovery Trends (GET /api/recovery/analytics/trends) — Feature 7.1 ──

export const RECOVERY_TRENDS_RANGES = ["7d", "30d", "90d"] as const;

export type RecoveryTrendsRange = (typeof RECOVERY_TRENDS_RANGES)[number];

/** Qualifying recovery cycles completed for one muscle within the range. */
export interface MuscleRecoveryFrequency {
  muscle: string;
  count: number;
}

/** One muscle's fatigue reading within a weekly fatigue snapshot. */
export interface WeeklyFatigueMuscle {
  muscle: string;
  fatigueScore: number;
}

/** Average muscle fatigue aggregated over one calendar week. */
export interface WeeklyFatigueEntry {
  /** ISO date (00:00 UTC) of the week's first day (Monday). */
  weekStart: string;
  /** Mean fatigue across the muscles trained that week (0 when none). */
  averageFatigue: number;
  muscleBreakdown: WeeklyFatigueMuscle[];
}

/**
 * Recovery trends response. `averageRecoveryHours` is the model-estimated time
 * to full recovery across in-range cycles; `observedRecoveryHours` is the
 * actually-observed time between repeated trainings of a muscle (null when no
 * cycle has been observed yet). Both are documented, deterministic rules
 * because the roadmap does not pin down exact formulas.
 */
export interface RecoveryTrendsResponse {
  range: RecoveryTrendsRange;
  averageRecoveryHours: number | null;
  observedRecoveryHours: number | null;
  recoveryFrequency: MuscleRecoveryFrequency[];
  weeklyFatigue: WeeklyFatigueEntry[];
  generatedAt: string;
}

// ── Recovery Reports (GET /api/recovery/analytics/reports) — Feature 7.2 ──

/** The muscle group carrying the highest recent fatigue in the period. */
export interface MostFatiguedMuscle {
  muscle: string;
  /** Estimated fatigue on the 0-100 score range. */
  fatigueScore: number;
}

/**
 * The muscle with the shortest average recovery duration. `isEstimated` is
 * true when the figure is the model's configured duration and false when it is
 * the time actually observed between repeat trainings.
 */
export interface FastestRecoveringMuscle {
  muscle: string;
  averageRecoveryHours: number;
  isEstimated: boolean;
}

/**
 * Contribution-weighted training workload for one muscle in the period. Both
 * measures are role-weighted (primary 100% / secondary 40% / stabilizer 20%),
 * so muscles are compared on comparable work rather than raw tonnage.
 */
export interface TrainingBalanceItem {
  muscle: string;
  totalVolume: number;
  completedSets: number;
}

/**
 * How regularly trained muscles returned to full recovery before their next
 * training. Only cycles with an available recovery estimate qualify, so the
 * percentage is never derived from data the model cannot evaluate.
 */
export interface RecoveryConsistency {
  qualifyingRecoveryEvents: number;
  completedRecoveryEvents: number;
  consistencyPercentage: number | null;
}

export interface RecoveryReportsResponse {
  range: RecoveryTrendsRange;
  mostFatiguedMuscle: MostFatiguedMuscle | null;
  fastestRecoveringMuscle: FastestRecoveringMuscle | null;
  trainingBalance: TrainingBalanceItem[];
  recoveryConsistency: RecoveryConsistency;
  generatedAt: string;
}