import { MUSCLE_GROUPS, type MuscleGroup } from "../../analytics/lib/muscleClassification";
import { resolveTrendsConfig } from "./recovery-analytics.calculator";
import type {
  FastestRecoveringMuscle,
  MostFatiguedMuscle,
  MuscleContributionTotal,
  MuscleFatigue,
  OvertrainingSession,
  RecoveryConsistency,
  RecoveryReportsResponse,
  RecoveryTrendsConfig,
  RecoveryTrendsRange,
  TrainingBalanceItem,
} from "../types/recovery.types";

/**
 * Recovery Reports Calculator (Feature 7.2)
 *
 * Pure, side-effect-free aggregation for the recovery report sections. Every
 * rule here is explicit, documented, and deterministic, and all sections share
 * a single period (the sessions/fatigue/contributions it receives are already
 * scoped to that period by the service):
 *
 * - Most fatigued muscle: the muscle with the highest recent fatigue score.
 *   Ties resolve to the canonical MUSCLE_GROUPS order so the result is stable.
 * - Fastest recovering muscle: the shortest average recovery duration among
 *   muscles trained in the period. An observed average (from repeat trainings)
 *   is preferred over a model estimate, and `isEstimated` records which was
 *   used. Ties break to observed over estimated, then to MUSCLE_GROUPS order.
 * - Training balance: contribution-weighted volume and set counts per muscle,
 *   so unrelated muscles are compared on role-normalized work rather than raw
 *   tonnage.
 * - Recovery consistency: the share of observed cycles (with an available
 *   estimate) in which the muscle reached full recovery before retraining.
 *
 * Nothing here touches the database, Redis, or the network.
 */

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function isUsableRecoveryHours(hours: number): boolean {
  return Number.isFinite(hours) && hours > 0;
}

const MS_PER_HOUR = 3_600_000;

// ── Observed cycles ────────────────────────────────────────────────

export interface ObservedCycle {
  muscle: MuscleGroup;
  /** Hours between two consecutive trainings of the muscle. */
  hours: number;
}

/**
 * Every observed training cycle in the period, i.e. the gap between a muscle's
 * training and its next training. The last training of a muscle has no later
 * training to observe and is therefore not a cycle.
 */
export function collectObservedCycles(
  sessions: OvertrainingSession[],
): ObservedCycle[] {
  const sorted = [...sessions].sort(
    (a, b) => a.endedAt.getTime() - b.endedAt.getTime(),
  );

  const byMuscle = new Map<MuscleGroup, number[]>();
  for (const session of sorted) {
    for (const muscle of session.musclesTrained) {
      const times = byMuscle.get(muscle) ?? [];
      times.push(session.endedAt.getTime());
      byMuscle.set(muscle, times);
    }
  }

  const cycles: ObservedCycle[] = [];
  for (const [muscle, times] of byMuscle) {
    for (let i = 0; i < times.length - 1; i++) {
      if (times[i + 1] > times[i]) {
        cycles.push({ muscle, hours: (times[i + 1] - times[i]) / MS_PER_HOUR });
      }
    }
  }
  return cycles;
}

/** Mean observed cycle duration per muscle, in MUSCLE_GROUPS order. */
export function observedAveragesByMuscle(
  sessions: OvertrainingSession[],
): Map<MuscleGroup, { averageHours: number; samples: number }> {
  const totals = new Map<MuscleGroup, { sum: number; samples: number }>();
  for (const cycle of collectObservedCycles(sessions)) {
    const entry = totals.get(cycle.muscle) ?? { sum: 0, samples: 0 };
    entry.sum += cycle.hours;
    entry.samples += 1;
    totals.set(cycle.muscle, entry);
  }

  const averages = new Map<MuscleGroup, { averageHours: number; samples: number }>();
  for (const [muscle, entry] of totals) {
    averages.set(muscle, {
      averageHours: entry.sum / entry.samples,
      samples: entry.samples,
    });
  }
  return averages;
}

/** Muscles trained at least once in the period, in MUSCLE_GROUPS order. */
function trainedMuscles(sessions: OvertrainingSession[]): MuscleGroup[] {
  const trained = new Set<MuscleGroup>();
  for (const session of sessions) {
    for (const muscle of session.musclesTrained) trained.add(muscle);
  }
  return MUSCLE_GROUPS.filter((muscle) => trained.has(muscle));
}

// ── Most fatigued muscle ───────────────────────────────────────────

/**
 * Highest recent fatigue score, ignoring untrained muscles (score <= 0). Ties
 * resolve to the canonical MUSCLE_GROUPS order. Null when nothing was trained.
 */
export function findMostFatiguedMuscle(
  fatigues: MuscleFatigue[],
  rounding = 1,
): MostFatiguedMuscle | null {
  const byMuscle = new Map<MuscleGroup, number>();
  for (const fatigue of fatigues) {
    if (Number.isFinite(fatigue.fatigueScore)) {
      byMuscle.set(fatigue.muscle, fatigue.fatigueScore);
    }
  }

  let best: MostFatiguedMuscle | null = null;
  for (const muscle of MUSCLE_GROUPS) {
    const score = byMuscle.get(muscle);
    if (score === undefined || score <= 0) continue;
    if (best === null || score > best.fatigueScore) {
      best = { muscle, fatigueScore: score };
    }
  }

  return best === null ? null : { ...best, fatigueScore: round(best.fatigueScore, rounding) };
}

// ── Fastest recovering muscle ──────────────────────────────────────

/**
 * Shortest average recovery duration among muscles trained in the period.
 * Observed averages (from repeat trainings) are preferred; a muscle without an
 * observed cycle falls back to the model's configured duration, flagged with
 * `isEstimated: true`. Only usable durations are eligible.
 */
export function findFastestRecoveringMuscle(
  sessions: OvertrainingSession[],
  recoveryHours: Record<MuscleGroup, number>,
  rounding = 1,
): FastestRecoveringMuscle | null {
  const observed = observedAveragesByMuscle(sessions);

  let best: FastestRecoveringMuscle | null = null;
  for (const muscle of trainedMuscles(sessions)) {
    const observedEntry = observed.get(muscle);
    let candidate: FastestRecoveringMuscle;

    if (observedEntry !== undefined) {
      candidate = {
        muscle,
        averageRecoveryHours: observedEntry.averageHours,
        isEstimated: false,
      };
    } else {
      const estimate = recoveryHours[muscle];
      if (!isUsableRecoveryHours(estimate)) continue;
      candidate = { muscle, averageRecoveryHours: estimate, isEstimated: true };
    }

    if (best === null || isFaster(candidate, best)) best = candidate;
  }

  return best === null
    ? null
    : { ...best, averageRecoveryHours: round(best.averageRecoveryHours, rounding) };
}

/**
 * "Faster" ordering: shorter duration wins; ties prefer an observed result over
 * a model estimate (stronger evidence). Equal on both counts keeps the earlier
 * (canonical order) candidate, since candidates are visited in MUSCLE_GROUPS
 * order.
 */
function isFaster(
  candidate: FastestRecoveringMuscle,
  current: FastestRecoveringMuscle,
): boolean {
  if (candidate.averageRecoveryHours !== current.averageRecoveryHours) {
    return candidate.averageRecoveryHours < current.averageRecoveryHours;
  }
  return current.isEstimated && !candidate.isEstimated;
}

// ── Training balance ───────────────────────────────────────────────

/**
 * Contribution-weighted workload per trained muscle. Kept in descending volume
 * order (ties by MUSCLE_GROUPS order) so the chart reads as a ranking. Muscles
 * with no weighted work are omitted; an empty period yields an empty list.
 */
export function buildTrainingBalance(
  contributions: MuscleContributionTotal[],
): TrainingBalanceItem[] {
  const items: TrainingBalanceItem[] = [];
  for (const contribution of contributions) {
    const totalVolume = contribution.weightedVolume;
    const completedSets = contribution.weightedSets;
    if (totalVolume <= 0 && completedSets <= 0) continue;
    items.push({ muscle: contribution.muscle, totalVolume, completedSets });
  }

  const order = new Map<MuscleGroup, number>(
    MUSCLE_GROUPS.map((muscle, index) => [muscle, index]),
  );
  return items.sort((a, b) => {
    if (b.totalVolume !== a.totalVolume) return b.totalVolume - a.totalVolume;
    return (order.get(a.muscle) ?? 0) - (order.get(b.muscle) ?? 0);
  });
}

// ── Recovery consistency ───────────────────────────────────────────

/**
 * Share of qualifying cycles in which the muscle reached full recovery before
 * its next training. A cycle qualifies only when a usable recovery estimate
 * exists, so the percentage is never computed from data the model cannot
 * evaluate; with no qualifying cycles the percentage is null (insufficient
 * history) rather than a misleading 0 or 100.
 */
export function calculateRecoveryConsistency(
  sessions: OvertrainingSession[],
  recoveryHours: Record<MuscleGroup, number>,
  rounding = 1,
): RecoveryConsistency {
  let qualifying = 0;
  let completed = 0;

  for (const cycle of collectObservedCycles(sessions)) {
    const estimate = recoveryHours[cycle.muscle];
    if (!isUsableRecoveryHours(estimate)) continue;
    qualifying += 1;
    if (cycle.hours >= estimate) completed += 1;
  }

  return {
    qualifyingRecoveryEvents: qualifying,
    completedRecoveryEvents: completed,
    consistencyPercentage:
      qualifying === 0 ? null : round((completed / qualifying) * 100, rounding),
  };
}

// ── Entry point ────────────────────────────────────────────────────

export interface RecoveryReportsAggregateInput {
  range: RecoveryTrendsRange;
  /** Completed sessions within the period (chronological or not). */
  sessions: OvertrainingSession[];
  /** Recent fatigue per trained muscle (from the fatigue engine). */
  fatigues: MuscleFatigue[];
  /** Contribution-weighted workload per muscle (from the fatigue engine). */
  contributions: MuscleContributionTotal[];
  /** Reference time the report anchors to. */
  now: Date;
  recoveryHours: Record<MuscleGroup, number>;
  config?: Partial<RecoveryTrendsConfig>;
}

/** Shapes the fully deterministic recovery reports for a period. */
export function calculateRecoveryReports(
  input: RecoveryReportsAggregateInput,
): RecoveryReportsResponse {
  const config = resolveTrendsConfig(input.config);
  const rounding = config.averageRounding;

  return {
    range: input.range,
    mostFatiguedMuscle: findMostFatiguedMuscle(input.fatigues, rounding),
    fastestRecoveringMuscle: findFastestRecoveringMuscle(
      input.sessions,
      input.recoveryHours,
      rounding,
    ),
    trainingBalance: buildTrainingBalance(input.contributions),
    recoveryConsistency: calculateRecoveryConsistency(
      input.sessions,
      input.recoveryHours,
      rounding,
    ),
    generatedAt: input.now.toISOString(),
  };
}