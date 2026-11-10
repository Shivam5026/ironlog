/**
 * Recovery Query Invalidation (Feature 8.2)
 *
 * Invalidate the entire recovery query family after a workout is completed so
 * every cached view — summary, muscle grid, readiness, recommendation,
 * timeline, trends, and reports — reflects the fresh fatigue/readiness
 * readings. A single `recoveryKeys.all` prefix covers them all.
 *
 * This complements backend Redis invalidation: TanStack Query invalidation
 * refreshes the browser's cached queries, while Redis invalidation refreshes
 * the server's cached responses. Each is a no-op for the other's cache.
 */

import { queryClient } from "@/shared/lib/query-client";
import { recoveryKeys } from "../queries/recovery-keys";

export function invalidateRecoveryQueries() {
  return queryClient.invalidateQueries({ queryKey: recoveryKeys.all });
}
