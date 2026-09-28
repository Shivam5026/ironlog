function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Estimate 1RM using the Epley formula.
 * Returns null for invalid inputs (weight <= 0 or reps <= 0).
 */
export function calculateEstimatedOneRepMax(
  weight: number,
  reps: number,
): number | null {
  if (weight <= 0 || reps <= 0) return null;
  return roundTo2(weight * (1 + reps / 30));
}
