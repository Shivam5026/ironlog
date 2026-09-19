type SetLike = {
  weight: { toString(): string } | number | string;
  reps: number;
  completed: boolean;
};

/** "Best" = heaviest completed set, ties broken by more reps. */
export function bestSet<T extends SetLike>(
  sets: T[],
): { weight: number; reps: number } | null {
  let best: { weight: number; reps: number } | null = null;
  for (const set of sets) {
    if (!set.completed) continue;
    const weight = Number(set.weight);
    if (
      best === null ||
      weight > best.weight ||
      (weight === best.weight && set.reps > best.reps)
    ) {
      best = { weight, reps: set.reps };
    }
  }
  return best;
}

/** Sessions that feed stats, history, PRs, streaks, and analytics. */
export const STATS_STATUSES = ["COMPLETED"] as const;

/** Terminal sessions that are deletable but do NOT count toward stats. */
export const TERMINAL_STATUSES = ["COMPLETED", "ABANDONED"] as const;
