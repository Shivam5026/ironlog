import type {
  MuscleRecovery,
  MuscleRecoveryItem,
  RecoveryStatus,
  RecoveryTimelineGroupItem,
  RecoveryTimelineItem,
} from "../types/recovery.types";

/**
 * Feature 6.2 — six-group muscle recovery grid.
 *
 * The backend reports the underlying 11 muscle groups; this module normalizes
 * them into the roadmap's six display groups. The existing Feature 3.1 status
 * thresholds are used verbatim (matching the server's `classifyRecoveryStatus`),
 * and multi-muscle groups aggregate percentages with a consistent rule rather
 * than an arbitrary average.
 */

type DisplayGroupId = "chest" | "back" | "legs" | "shoulders" | "arms" | "core";

export const MUSCLE_DISPLAY_GROUPS: ReadonlyArray<{
  id: DisplayGroupId;
  label: string;
  /** Underlying server muscle groups that roll up into this display group. */
  members: readonly string[];
}> = [
  { id: "chest", label: "Chest", members: ["Chest"] },
  { id: "back", label: "Back", members: ["Back"] },
  { id: "legs", label: "Legs", members: ["Legs", "Glutes", "Hamstrings", "Calves"] },
  { id: "shoulders", label: "Shoulders", members: ["Shoulders"] },
  { id: "arms", label: "Arms", members: ["Biceps", "Triceps", "Forearms"] },
  { id: "core", label: "Core", members: ["Core"] },
];

/**
 * Feature 3.1 status thresholds, mapped from a recovery percentage exactly as
 * the server's recovery calculator does:
 *   0-39 NOT_READY | 40-69 RECOVERING | 70-89 NEARLY_READY | 90-100 FULLY_RECOVERED
 */
export function classifyRecoveryStatus(percentage: number): RecoveryStatus {
  if (percentage < 40) return "NOT_READY";
  if (percentage < 70) return "RECOVERING";
  if (percentage < 90) return "NEARLY_READY";
  return "FULLY_RECOVERED";
}

/**
 * Aggregation rule for multi-muscle display groups: combined recovery is the
 * lowest recovery percentage among the group's components. A group is only as
 * ready as its least-recovered muscle, so the minimum is the truthful "ready
 * to train" signal and is applied identically to every combined group (Arms,
 * Legs). The combined status is re-derived from Feature 3.1 thresholds and the
 * group's training time is the most recent of its members.
 */
function combineGroup(
  members: readonly string[],
  musclesByGroup: Map<string, MuscleRecovery>,
): MuscleRecoveryItem {
  const components = members
    .map((muscle) => musclesByGroup.get(muscle))
    .filter((muscle): muscle is MuscleRecovery => muscle !== undefined);

  if (components.length === 0) {
    return {
      muscle: members[0],
      recoveryPercentage: 100,
      status: "FULLY_RECOVERED",
      lastTrainedAt: null,
      components: [],
    };
  }

  const recoveryPercentage = Math.min(
    ...components.map((muscle) => muscle.recoveryPercentage),
  );

  const lastTrainedAt = components.reduce<string | null>(
    (latest, muscle) =>
      muscle.lastTrainedAt !== null &&
      (latest === null || muscle.lastTrainedAt > latest)
        ? muscle.lastTrainedAt
        : latest,
    null,
  );

  return {
    muscle: members[0],
    recoveryPercentage,
    status: classifyRecoveryStatus(recoveryPercentage),
    lastTrainedAt,
    components,
  };
}

/** Normalizes the 11 backend muscle readings into the six display groups. */
export function buildRecoveryGridItems(
  muscles: MuscleRecovery[],
): MuscleRecoveryItem[] {
  const musclesByGroup = new Map<string, MuscleRecovery>();
  for (const muscle of muscles) musclesByGroup.set(muscle.muscle, muscle);

  return MUSCLE_DISPLAY_GROUPS.map((group) =>
    combineGroup(group.members, musclesByGroup),
  );
}

/**
 * Feature 6.3 timeline aggregation. Recovery percentage follows the same
 * minimum rule as the grid. The group's full-recovery estimate is the latest
 * of its members' estimates (the group is recovered once ALL members are),
 * and the training time is the most recent member. Members with no reliable
 * estimate do not fabricate one — if no member has an estimate, the group's
 * estimate stays null.
 */
function combineTimelineGroup(
  members: readonly string[],
  itemsByMuscle: Map<string, RecoveryTimelineItem>,
): RecoveryTimelineGroupItem {
  const components = members
    .map((muscle) => itemsByMuscle.get(muscle))
    .filter((item): item is RecoveryTimelineItem => item !== undefined);

  if (components.length === 0) {
    return {
      muscle: members[0],
      recoveryPercentage: 100,
      status: "FULLY_RECOVERED",
      lastTrainedAt: null,
      estimatedFullRecoveryAt: null,
      estimatedHoursRemaining: null,
      components: [],
    };
  }

  const recoveryPercentage = Math.min(
    ...components.map((item) => item.recoveryPercentage),
  );

  const lastTrainedAt = components.reduce<string | null>(
    (latest, item) =>
      item.lastTrainedAt !== null &&
      (latest === null || item.lastTrainedAt > latest)
        ? item.lastTrainedAt
        : latest,
    null,
  );

  const completionTimes = components
    .map((item) => item.estimatedFullRecoveryAt)
    .filter((value): value is string => value !== null)
    .map((value) => Date.parse(value));

  const estimatedFullRecoveryAt =
    completionTimes.length > 0
      ? new Date(Math.max(...completionTimes)).toISOString()
      : null;

  const remainingHours = components
    .map((item) => item.estimatedHoursRemaining)
    .filter((value): value is number => value !== null);

  const estimatedHoursRemaining =
    remainingHours.length > 0 ? Math.max(...remainingHours) : null;

  return {
    muscle: members[0],
    recoveryPercentage,
    status: classifyRecoveryStatus(recoveryPercentage),
    lastTrainedAt,
    estimatedFullRecoveryAt,
    estimatedHoursRemaining,
    components,
  };
}

/** Normalizes the 11 timeline entries into the six roadmap display groups. */
export function buildTimelineGroups(
  items: RecoveryTimelineItem[],
): RecoveryTimelineGroupItem[] {
  const itemsByMuscle = new Map<string, RecoveryTimelineItem>();
  for (const item of items) itemsByMuscle.set(item.muscle, item);

  return MUSCLE_DISPLAY_GROUPS.map((group) =>
    combineTimelineGroup(group.members, itemsByMuscle),
  );
}

// ── Feature 7.1 recovery-frequency display grouping ────────────────

export interface MuscleFrequencyGroup {
  muscle: string;
  /** Total qualifying recovery cycles across the group's members. */
  count: number;
}

/**
 * Rolls the 11 backend muscle counts up into the six display groups (summing
 * member counts) so the frequency chart uses the same vocabulary as the grid
 * and timeline. Ordering follows the shared display-group order.
 */
export function buildFrequencyByDisplayGroup(
  frequency: { muscle: string; count: number }[],
): MuscleFrequencyGroup[] {
  const countByMuscle = new Map(
    frequency.map((entry) => [entry.muscle, entry.count]),
  );

  return MUSCLE_DISPLAY_GROUPS.map((group) => ({
    muscle: group.label,
    count: group.members.reduce(
      (sum, muscle) => sum + (countByMuscle.get(muscle) ?? 0),
      0,
    ),
  }));
}