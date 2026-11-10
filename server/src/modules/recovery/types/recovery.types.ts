import type { MuscleGroup } from "../../analytics/lib/muscleClassification";

// ── Recovery Status ────────────────────────────────────────────────

export const RECOVERY_STATUSES = [
  "NOT_READY",
  "RECOVERING",
  "NEARLY_READY",
  "FULLY_RECOVERED",
] as const;

export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

// ── Standardized Response Contract ─────────────────────────────────

export interface MuscleRecovery {
  muscle: MuscleGroup;
  /** Estimated fatigue on the 0-100 score range (Epic 2). */
  fatigueScore: number;
  /** Recovery percentage 0-100, derived from the fatigue score (Epic 3). */
  recoveryPercentage: number;
  status: RecoveryStatus;
  /** ISO timestamp of the most recent completed set, or null if untrained. */
  lastTrainedAt: string | null;
}

export interface RecoverySummary {
  muscles: MuscleRecovery[];
  calculatedAt: string;
}

// ── Recovery Timeline (Feature 6.3) ────────────────────────────────

/**
 * A single muscle's recovery timeline entry. Values are derived from the same
 * Feature 3.2 calculator as the summary, so `recoveryPercentage` is always
 * identical to the summary's number and the estimate never diverges from it.
 */
export interface RecoveryTimelineItem {
  muscle: MuscleGroup;
  /** ISO timestamp of the most recent completed workout, or null if untrained. */
  lastTrainedAt: string | null;
  /** Current recovery percentage 0-100, identical to the Recovery Service value. */
  recoveryPercentage: number;
  /**
   * ISO timestamp when recovery reaches 100%, or null when it cannot be
   * estimated reliably (untrained muscle, unusable recovery duration).
   * Never a fabricated value.
   */
  estimatedFullRecoveryAt: string | null;
  /**
   * Whole hours until full recovery (0 when already fully recovered), or null
   * when no reliable estimate exists.
   */
  estimatedHoursRemaining: number | null;
}

// ── Recovery Analytics / Trends (Feature 7.1) ─────────────────────

/** Supported recovery-trends analysis ranges. */
export type RecoveryTrendsRange = "7d" | "30d" | "90d";

/** Qualifying recovery cycles completed for one muscle within a range. */
export interface MuscleRecoveryFrequency {
  muscle: MuscleGroup;
  count: number;
}

/** One muscle's fatigue reading within a weekly fatigue snapshot. */
export interface WeeklyFatigueMuscle {
  muscle: MuscleGroup;
  fatigueScore: number;
}

/** Average muscle fatigue aggregated over one calendar week. */
export interface WeeklyFatigueEntry {
  /** ISO date (00:00 UTC) of the week's first day (default Monday). */
  weekStart: string;
  /** Mean fatigue across the muscles trained that week (0 when none). */
  averageFatigue: number;
  muscleBreakdown: WeeklyFatigueMuscle[];
}

/**
 * Recovery trends response. `averageRecoveryHours` is the model-estimated time
 * for in-range training cycles to reach full recovery; `observedRecoveryHours`
 * is the actually-observed time between consecutive trainings of the same
 * muscle (null when a cycle has not been observed yet). The roadmap does not
 * pin down exact formulas, so both are documented, deterministic rules.
 */
export interface RecoveryTrendsResponse {
  range: RecoveryTrendsRange;
  /** Model-estimated mean recovery time (hours) for in-range cycles. */
  averageRecoveryHours: number | null;
  /** Observed mean recovery time (hours) between repeated trainings of a muscle. */
  observedRecoveryHours: number | null;
  recoveryFrequency: MuscleRecoveryFrequency[];
  weeklyFatigue: WeeklyFatigueEntry[];
  generatedAt: string;
}

/**
 * Recovery-trends configuration. The roadmap does not specify ranges, week
 * boundaries, or event definitions, so these are tunable, documented defaults.
 */
export interface RecoveryTrendsConfig {
  /** Days each supported range spans. */
  rangeDays: Record<RecoveryTrendsRange, number>;
  /** Week boundary weekday: 0=Sunday … 6=Saturday. Default 1 (Monday). */
  weekStartDay: number;
  /** Decimal places for rounded averages. */
  averageRounding: number;
}

export interface RecoveryTrendsOptions {
  /** Period to analyze. Defaults to "30d". */
  range?: RecoveryTrendsRange;
  /** Reference time. Defaults to now. Explicit times bypass the cache. */
  now?: Date;
  /** Override aggregation configuration. Bypasses the cache. */
  config?: Partial<RecoveryTrendsConfig>;
}

// ── Recovery Reports (Feature 7.2) ────────────────────────────────

/** The muscle group carrying the highest recent fatigue in the period. */
export interface MostFatiguedMuscle {
  muscle: MuscleGroup;
  /** Estimated fatigue on the 0-100 score range. */
  fatigueScore: number;
}

/**
 * The muscle group with the shortest average recovery duration. `isEstimated`
 * is true when the figure is the model's configured duration (no repeated
 * training of that muscle was observed in the period) and false when it is the
 * average time actually observed between repeat trainings.
 */
export interface FastestRecoveringMuscle {
  muscle: MuscleGroup;
  averageRecoveryHours: number;
  /** True for a model estimate; false for an observed measurement. */
  isEstimated: boolean;
}

/**
 * Contribution-weighted training workload for one muscle in the period. Both
 * measures are contribution-weighted (primary 100% / secondary 40% /
 * stabilizer 20%), so muscles are compared on comparable, role-normalized
 * work rather than raw tonnage.
 */
export interface TrainingBalanceItem {
  muscle: MuscleGroup;
  /** Contribution-weighted volume (weight x reps, scaled by role weight). */
  totalVolume: number;
  /** Contribution-weighted completed working sets (scaled by role weight). */
  completedSets: number;
}

/**
 * How regularly trained muscles returned to full recovery before their next
 * training. Only cycles with an available recovery estimate qualify, so the
 * percentage is never derived from data the model cannot evaluate.
 */
export interface RecoveryConsistency {
  /** Observed training cycles that had an available recovery estimate. */
  qualifyingRecoveryEvents: number;
  /** Qualifying cycles where full recovery was reached before retraining. */
  completedRecoveryEvents: number;
  /** completed / qualifying as a percentage, or null with no qualifying data. */
  consistencyPercentage: number | null;
}

/**
 * Recovery reports response (Feature 7.2). All sections share one period and
 * are computed from the same normalized history as Feature 7.1. Estimated and
 * observed recovery measurements are always distinguished, and ties between
 * equally scored muscles resolve deterministically.
 */
export interface RecoveryReportsResponse {
  range: RecoveryTrendsRange;
  mostFatiguedMuscle: MostFatiguedMuscle | null;
  fastestRecoveringMuscle: FastestRecoveringMuscle | null;
  trainingBalance: TrainingBalanceItem[];
  recoveryConsistency: RecoveryConsistency;
  generatedAt: string;
}

export interface RecoveryReportsOptions {
  /** Period to analyze. Defaults to "30d". */
  range?: RecoveryTrendsRange;
  /** Reference time. Defaults to now. Explicit times bypass the cache. */
  now?: Date;
  /** Override aggregation configuration. Bypasses the cache. */
  config?: Partial<RecoveryTrendsConfig>;
}

// ── Internal: Aggregated Workload ──────────────────────────────────

/** Contribution role of a muscle group within a single exercise. */
export type MuscleRole = "PRIMARY" | "SECONDARY" | "STABILIZER";

export interface MuscleRoleAssignment {
  primary: MuscleGroup[];
  secondary: MuscleGroup[];
  stabilizer: MuscleGroup[];
}

// ── Recovery Calculator Configuration (Epic 3) ─────────────────────
//
// The roadmap defines recovery status thresholds but not the exact formula
// that turns a fatigue score into a recovery percentage. That relationship is
// made explicit and configurable here rather than assumed to be a simple
// inversion.

export interface RecoveryCalculatorConfig {
  /** The fatigue score that maps to 0% recovery. Default: 100. */
  fatigueAtZeroRecovery: number;
  /** The fatigue score that maps to 100% recovery. Default: 0. */
  fatigueAtFullRecovery: number;
  /**
   * Hours each muscle group needs to reach 100% recovery (Feature 3.2).
   * Initial tuning defaults, not scientifically precise or roadmap-mandated.
   */
  recoveryHours: Record<MuscleGroup, number>;
}

// ── Fatigue Model (Feature 2.1) ────────────────────────────────────
//
// A fatigue score estimates how worked a muscle group is, using the six
// roadmap factors: training volume, set count, exercise intensity, exercise
// frequency, target (primary) muscles, and secondary muscles.

/**
 * Normalized per-exercise workload — the input to the fatigue calculator.
 *
 * Produced by FatigueService from completed workout history. The calculator
 * never talks to the database or to exercise metadata directly.
 */
export interface ExerciseWorkload {
  exerciseId: string;
  exerciseName: string;
  /** Sum of weight x reps over valid completed working sets. */
  totalVolume: number;
  /** Number of valid completed working sets. */
  completedSets: number;
  /**
   * Mean intensity normalized to 0-1, or null when no reliable intensity
   * data exists (e.g. no RPE recorded). Never fabricated.
   */
  averageIntensity: number | null;
  /** Most recent completed set for this exercise. */
  lastPerformedAt: Date;
  /** Muscle groups this exercise targets (from exercise metadata). */
  primaryMuscles: MuscleGroup[];
  /** Muscle groups this exercise secondarily involves (from metadata). */
  secondaryMuscles: MuscleGroup[];
  /** Muscle groups that stabilize the exercise (from metadata). */
  stabilizerMuscles: MuscleGroup[];
  /**
   * Distinct completed sessions in which this exercise was performed,
   * used to derive training frequency. May repeat across exercises.
   */
  sessionIds: string[];
}

/** Intermediate factor scores, exposed so the model can be tuned later. */
export interface MuscleFatigueFactors {
  /** Normalized 0-1 volume contribution. */
  volume: number;
  /** Normalized 0-1 set-count contribution. */
  sets: number;
  /** Normalized 0-1 intensity contribution (fallback applied when absent). */
  intensity: number;
  /** Whether reliable intensity data contributed to this muscle. */
  intensityAvailable: boolean;
  /** Normalized 0-1 training-frequency contribution. */
  frequency: number;
  /** Normalized 0-1 recency contribution (more recent = higher). */
  recency: number;
}

/** Final fatigue result for a single muscle group. */
export interface MuscleFatigue {
  muscle: MuscleGroup;
  /** Estimated fatigue on the configured score range (default 0-100). */
  fatigueScore: number;
  /**
   * Fatigue immediately after the muscle's latest workout (recency at its
   * peak). Feature 3.2 uses it as the starting baseline for the explicit
   * time-based recovery curve, so time already decayed inside `fatigueScore`
   * (via the recency factor) is not counted a second time.
   */
  fatigueAtTraining: number;
  totalVolume: number;
  totalSets: number;
  lastTrainedAt: Date | null;
  /** Intermediate metrics, retained for tuning in later features. */
  factors: MuscleFatigueFactors;
}

/**
 * Muscle contribution weights. Feature 2.2 defines the roadmap values
 * (Primary 100%, Secondary 40%, Stabilizer 20%); they remain configurable.
 */
export interface MuscleContributionWeights {
  primary: number;
  secondary: number;
  stabilizer: number;
}

/** Workload attributed to one muscle within a single exercise. */
export interface WeightedMuscleWorkload {
  muscle: MuscleGroup;
  /** The role that determined this muscle's weight. */
  role: MuscleRole;
  /** Contribution weight applied (1.0 primary / 0.4 secondary / 0.2 stabilizer). */
  weight: number;
  /** totalVolume x weight. */
  weightedVolume: number;
  /** completedSets x weight. */
  weightedSets: number;
}

/**
 * Aggregated weighted workload for a muscle across every exercise.
 * Aggregation is by normalized muscle group, so naming variations do not
 * produce duplicate entries. Role volumes are retained for auditing.
 */
export interface MuscleContributionTotal {
  muscle: MuscleGroup;
  weightedVolume: number;
  weightedSets: number;
  primaryVolume: number;
  secondaryVolume: number;
  stabilizerVolume: number;
}

export interface FatigueCalculatorConfig {
  /** Inclusive lower bound of the fatigue score range. */
  scoreMin: number;
  /** Inclusive upper bound of the fatigue score range. */
  scoreMax: number;
  /** Lookback window in hours; older work is ignored. */
  lookbackHours: number;
  /** Volume (after contribution weighting) that saturates the volume factor. */
  volumeReference: number;
  /** Set count (after weighting) that saturates the sets factor. */
  setsReference: number;
  /** Sessions in the window that saturate the frequency factor. */
  frequencyReference: number;
  /** Neutral intensity (0-1) used when no reliable intensity data exists. */
  intensityFallback: number;
  /** Relative weights of each factor in the final blend. */
  factorWeights: {
    volume: number;
    sets: number;
    intensity: number;
    frequency: number;
    recency: number;
  };
  /** Contribution weights for primary vs secondary muscles. */
  contributions: MuscleContributionWeights;
}

// ── Daily Readiness (Feature 4.1) ──────────────────────────────────
//
// A 0-100 score estimating how ready the user is to train today, blending the
// four roadmap factors. The numeric score is kept separate from the readiness
// label — Feature 4.2 defines the roadmap's Low / Moderate / High levels.

/** The four readiness factors, each normalized to 0-100 (100 = fully ready). */
export interface ReadinessFactors {
  muscleRecovery: number;
  workoutFrequency: number;
  consecutiveTrainingDays: number;
  workoutDurationTrend: number;
}

export type ReadinessLevel = "LOW" | "MODERATE" | "HIGH";

/** Boundary scores that separate the readiness levels. */
export interface ReadinessThresholds {
  /** Scores below this are LOW. */
  low: number;
  /** Scores below this are MODERATE; at or above it are HIGH. */
  moderate: number;
}

/** The daily readiness response. Higher is more ready. */
export interface DailyReadiness {
  score: number;
  level: ReadinessLevel;
  factors: ReadinessFactors;
  calculatedAt: string;
}

/** Relative weights of each readiness factor. Sum should equal 1. */
export interface ReadinessWeights {
  muscleRecovery: number;
  workoutFrequency: number;
  consecutiveTrainingDays: number;
  workoutDurationTrend: number;
}

/** Raw inputs the calculator turns into normalized factors. */
export interface ReadinessFactorInputs {
  /** Recovery percentages of the muscles the user trained recently. */
  recoveryPercentages: number[];
  /** Completed sessions within the frequency window. */
  recentSessionCount: number;
  /** Current run of consecutive training days. */
  consecutiveTrainingDays: number;
  /** Average recent session duration in seconds, or null if unknown. */
  recentAvgDurationSeconds: number | null;
  /** Average long-term session duration in seconds, or null if unknown. */
  baselineAvgDurationSeconds: number | null;
}

/**
 * Readiness calculation configuration. The roadmap specifies the factors but
 * not their weights or exact scoring; everything here is a tunable default.
 */
export interface ReadinessCalculatorConfig {
  /** Factor weights. Renormalized to sum 1 before scoring. */
  weights: ReadinessWeights;
  /** Days back used for recent frequency, streak, and recent duration. */
  frequencyWindowDays: number;
  /** Sessions in the window that saturate the frequency penalty (factor 0). */
  frequencyReference: number;
  /** Consecutive training days that saturate the streak penalty (factor 0). */
  streakReferenceDays: number;
  /** Days back used for the long-term duration baseline. */
  baselineWindowDays: number;
  /**
   * Multiplier applied to the "longer than usual" deviation percentage.
   * A 100% longer-than-usual recent average costs `durationSensitivity * 100`.
   */
  durationSensitivity: number;
  /** Days back the muscle-recovery factor evaluates trained muscles over. */
  muscleRecoveryLookbackDays: number;
  /** Score boundaries for the LOW / MODERATE / HIGH readiness level mapping. */
  readinessThresholds: ReadinessThresholds;
}

export interface ReadinessOptions {
  /** Reference time. Defaults to the current time. */
  now?: Date;
  /** Override readiness calculation configuration. */
  config?: Partial<ReadinessCalculatorConfig>;
}

// ── Today's Recommendation (Feature 5.1) ───────────────────────────

/** The five roadmap-defined daily recommendations. */
export type WorkoutRecommendationType =
  | "TRAIN_PUSH"
  | "TRAIN_PULL"
  | "TRAIN_LEGS"
  | "ACTIVE_RECOVERY"
  | "REST_DAY";

/** The training splits the recommendation engine distinguishes. */
export type TrainingSplit = "PUSH" | "PULL" | "LEGS";

/** The daily recommendation response. */
export interface TodayRecommendation {
  type: WorkoutRecommendationType;
  title: string;
  reason: string;
  readinessScore: number;
  readinessLevel: "LOW" | "MODERATE" | "HIGH";
  targetMuscles: string[];
  generatedAt: string;
}

/** Raw inputs the recommendation decision engine consumes. */
export interface RecommendationInput {
  readinessScore: number;
  readinessLevel: ReadinessLevel;
  /** Recovery percentage (0-100) for every muscle group. */
  muscleRecovery: Record<MuscleGroup, number>;
  /** Recent completed sessions per training split. */
  splitSessionCounts: Record<TrainingSplit, number>;
  /** Split of the most recent completed session, if classifiable. */
  lastTrainedSplit: TrainingSplit | null;
  /** Consecutive training days leading up to the reference time. */
  consecutiveTrainingDays: number;
}

/**
 * Recommendation decision-engine configuration. These are configurable
 * defaults, not canonical roadmap values.
 */
export interface RecommendationCalculatorConfig {
  /** Readiness score below which a rest day is recommended. */
  restReadinessThreshold: number;
  /** Consecutive training days at/above which active recovery is recommended. */
  fatigueStreakThreshold: number;
  /** Every muscle in a split must meet this to be recommended for training. */
  groupRecoveryThreshold: number;
  /** Days back muscle recovery (and split suitability) is assessed over. */
  recoveryWindowDays: number;
  /** Days back used to build the recent training-split history. */
  splitHistoryWindowDays: number;
}

export interface RecommendationOptions {
  /** Reference time. Defaults to the current time. */
  now?: Date;
  /** Override recommendation-engine configuration. */
  config?: Partial<RecommendationCalculatorConfig>;
}

// ── Exercise Recommendations (Feature 5.2) ─────────────────────────

/** A suggested alternative to a recommended exercise. */
export interface ExerciseAlternative {
  exerciseId: string;
  exerciseName: string;
  reason: string;
}

/** A single recommended exercise, plus its lower-fatigue alternatives. */
export interface ExerciseRecommendation {
  exerciseId: string;
  exerciseName: string;
  targetMuscles: string[];
  /** Mean recovery of the exercise's target muscles (0-100). */
  recoveryPercentage: number;
  reason: string;
  alternatives: ExerciseAlternative[];
}

/** The daily exercise-recommendations response. */
export interface ExerciseRecommendationsResponse {
  recommendedExercises: ExerciseRecommendation[];
  priorityMuscles: string[];
  generatedAt: string;
}

/** A candidate exercise the ranking engine can choose from. */
export interface ExerciseCandidate {
  exerciseId: string;
  exerciseName: string;
  targetMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipments: string[];
}

/** Raw inputs for the exercise-recommendation ranking engine. */
export interface ExerciseRecommendationInput {
  /** Muscle groups today's workout recommendation focuses on. */
  recommendedTargetMuscles: MuscleGroup[];
  /** Title of today's workout recommendation (for explanations). */
  recommendationTitle?: string;
  /** Recovery percentage (0-100) for every muscle group. */
  muscleRecovery: Record<MuscleGroup, number>;
  candidates: ExerciseCandidate[];
  /** Equipment the user has available; empty means no restriction. */
  availableEquipment: string[];
}

/**
 * Exercise-recommendation ranking configuration. Exact weights and recovery
 * thresholds are not prescribed by the roadmap, so these are configurable
 * defaults.
 */
export interface ExerciseRecommendationConfig {
  /** Muscles at/above this recovery count as "sufficiently recovered". */
  recoveredMuscleThreshold: number;
  /** Muscles below this are "heavily fatigued" and deprioritized. */
  fatiguedMuscleThreshold: number;
  maxRecommendations: number;
  maxAlternativesPerExercise: number;
  /** When true, exercises needing equipment outside the user's list are dropped. */
  equipmentStrict: boolean;
  /** Days back muscle recovery is assessed over. */
  recoveryLookbackDays: number;
  /** Days back the user's recent sessions feed the exercise library. */
  libraryLookbackDays: number;
  /** ExerciseDB search limit used when enriching the exercise library. */
  enrichmentLimitPerMuscle: number;
}

export interface ExerciseRecommendationOptions {
  /** Reference time. Defaults to the current time. */
  now?: Date;
  /** Override exercise-recommendation ranking configuration. */
  config?: Partial<ExerciseRecommendationConfig>;
  /** Equipment the user has available; empty means no restriction. */
  availableEquipment?: string[];
}

// ── Overtraining Detection (Feature 5.3) ───────────────────────────

/** Severity of a detected overtraining pattern. */
export type TrainingRiskLevel = "LOW" | "MODERATE" | "HIGH";

/** The three overtraining patterns Feature 5.3 detects. */
export type TrainingRiskType =
  | "EXCESSIVE_VOLUME"
  | "CONSECUTIVE_HEAVY_SESSIONS"
  | "MUSCLE_WORKLOAD_IMBALANCE";

/** Quantitative support for a raised flag, for the frontend to explain it. */
export interface TrainingRiskEvidence {
  observedValue: number;
  threshold: number;
  unit: string;
}

/** A single detected overtraining pattern. */
export interface TrainingRiskFlag {
  type: TrainingRiskType;
  level: TrainingRiskLevel;
  message: string;
  /** Muscle groups driving or affected by the pattern. */
  affectedMuscles: string[];
  evidence: TrainingRiskEvidence;
}

/** The full overtraining analysis for today. */
export interface OvertrainingAnalysis {
  riskLevel: TrainingRiskLevel;
  flags: TrainingRiskFlag[];
  recommendations: string[];
  analyzedAt: string;
}

/** A completed session, normalized for overtraining analysis. */
export interface OvertrainingSession {
  endedAt: Date;
  /** Sum of weight x reps over valid completed working sets. */
  volume: number;
  /** Number of valid completed working sets. */
  sets: number;
  /** Weighted workload (contribution-weighted volume) per muscle group. */
  muscleWorkload: Record<MuscleGroup, number>;
  /** Muscle groups the session trained via any contribution role. */
  musclesTrained: MuscleGroup[];
}

/** Raw inputs consumed by the overtraining decision engine. */
export interface OvertrainingInput {
  /** Completed sessions within the analysis lookback, chronological. */
  sessions: OvertrainingSession[];
  now: Date;
}

/**
 * Overtraining detection configuration. These are configurable defaults with
 * documented fallbacks for newer users; no single volume is claimed to be
 * universally excessive.
 */
export interface OvertrainingConfig {
  /** Days back counted as the "recent" window being assessed. */
  volumeWindowDays: number;
  /** Days back (before the window) used as the user's own baseline. */
  baselineWindowDays: number;
  /** Baseline sessions needed before personalized thresholds replace fallbacks. */
  minBaselineSessions: number;
  /** Window per-training-day volume >= baseline x this flags excessive volume. */
  volumePerTrainingDayMultiplier: number;
  /** Volume ratio at/above which an excessive-volume flag is HIGH. */
  volumeHighRatio: number;
  /** A session is heavy when volume >= baseline mean session volume x this. */
  heavySessionVolumeMultiplier: number;
  /** A session is heavy when sets >= baseline mean session sets x this. */
  heavySessionSetMultiplier: number;
  /** Consecutive heavy calendar days at/above which a flag is raised. */
  consecutiveHeavyDays: number;
  /** Window muscle share >= baseline share x this flags an imbalance. */
  muscleShareRatio: number;
  /** Smallest window share considered for an imbalance (personalized rule). */
  minMuscleShareFloor: number;
  /** A flagged muscle at/above this window share makes the flag HIGH. */
  highMuscleShare: number;
  /** Documented fallback per-training-day volume for users without a baseline. */
  fallbackVolumePerTrainingDay: number;
  /** Documented fallback threshold for a single heavy session (volume). */
  fallbackHeavySessionVolume: number;
  /** Documented fallback threshold for a single heavy session (sets). */
  fallbackHeavySessionSets: number;
  /** Documented fallback share at/above which a muscle is imbalanced. */
  fallbackMaxMuscleShare: number;
}

export interface OvertrainingOptions {
  /** Reference time. Defaults to the current time. */
  now?: Date;
  /** Override overtraining detection configuration. */
  config?: Partial<OvertrainingConfig>;
}
