/**
 * Compatibility re-export. The canonical implementation lives in
 * `../queries/use-recovery-queries` (Feature 8.2), which centralizes the query
 * keys, stale times, and retry policy for the whole Recovery System.
 */
export { useRecoverySummary } from "../queries/use-recovery-queries";
