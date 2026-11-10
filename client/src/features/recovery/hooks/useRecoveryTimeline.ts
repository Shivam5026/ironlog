/**
 * Compatibility re-export. The canonical implementation lives in
 * `../queries/use-recovery-queries` (Feature 8.2), which keeps the timeline on
 * the shared `["recovery"]` prefix so workout-completion invalidation refreshes
 * it alongside the rest of the dashboard.
 */
export { useRecoveryTimeline } from "../queries/use-recovery-queries";
