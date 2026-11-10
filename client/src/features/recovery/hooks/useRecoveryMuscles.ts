/**
 * Compatibility re-export. The canonical implementation lives in
 * `../queries/use-recovery-queries` (Feature 8.2). The muscle grid shares the
 * summary cache entry so it never fires a duplicate request.
 */
export { useRecoveryMuscles } from "../queries/use-recovery-queries";
