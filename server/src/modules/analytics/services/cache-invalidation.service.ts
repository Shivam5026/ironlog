/**
 * Analytics Cache Invalidation Service
 *
 * Centralized invalidation for all analytics caches.
 * Call this from mutation flows (workout completion, body weight changes, etc.)
 */

import { invalidateUserAnalytics } from "./cache.service";

export { invalidateUserAnalytics };
