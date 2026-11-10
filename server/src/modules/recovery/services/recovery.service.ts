import { RecoveryCalculator } from "../utils/recovery.calculator";
import { FatigueService, type FatigueOptions } from "./fatigue.service";
import {
  redisRecoveryCacheBackend,
  getRecoveryRefreshThresholdMs,
  type RecoveryCacheBackend,
} from "./recovery-cache.service";
import type { CacheEntry } from "../../../lib/cache";
import type {
  RecoveryCalculatorConfig,
  RecoverySummary,
  RecoveryTimelineItem,
} from "../types/recovery.types";

/**
 * Recovery Service (Feature 1.1 contract, rebuilt by Feature 3.1)
 *
 * Orchestrates the fatigue-based recovery pipeline:
 *   completed workout history → muscle fatigue (Epic 2, with Feature 2.2
 *   weighted contributions) → recovery percentage per muscle (Epic 3).
 *
 * All recovery math lives in RecoveryCalculator and all data access lives in
 * FatigueService; this class only composes them and applies the cache.
 */

export interface RecoverySummaryOptions {
  /** Reference time for the recovery estimate. Defaults to the current time. */
  now?: Date;
  /** Restrict aggregation to sessions ending on/after this date. */
  since?: Date;
  /** Override the fatigue calculation (lookback, config, contribution weights). */
  fatigue?: FatigueOptions;
  /** Override the fatigue→recovery formula configuration. */
  config?: Partial<RecoveryCalculatorConfig>;
}

export class RecoveryService {
  private readonly fatigue: FatigueService;
  private readonly calculator: RecoveryCalculator;
  private readonly cache: RecoveryCacheBackend;

  constructor(
    fatigue: FatigueService = new FatigueService(),
    calculator: RecoveryCalculator = new RecoveryCalculator(),
    cache: RecoveryCacheBackend = redisRecoveryCacheBackend,
  ) {
    this.fatigue = fatigue;
    this.calculator = calculator;
    this.cache = cache;
  }

  private toFatigueOptions(options: RecoverySummaryOptions): FatigueOptions {
    return {
      ...options.fatigue,
      now: options.now ?? options.fatigue?.now,
      since: options.since ?? options.fatigue?.since,
    };
  }

  private resolveConfig(
    options: RecoverySummaryOptions,
  ): RecoveryCalculatorConfig {
    return { ...this.calculator.getConfig(), ...options.config };
  }

  /**
   * The single recovery calculation. Both the cache-miss path and the
   * background refresh path call this, so the calculation is never
   * duplicated or diverging.
   */
  private async calculateSummary(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoverySummary> {
    const always = {
      now: options.now ?? new Date(),
    };

    const fatigues = await this.fatigue.getMuscleFatigue(
      userId,
      this.toFatigueOptions(options),
    );

    return new RecoveryCalculator(this.resolveConfig(options)).calculateRecovery(
      fatigues,
      always.now,
    );
  }

  /** Calculates and caches. Used on cache miss. */
  private async calculateAndCache(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoverySummary> {
    const summary = await this.calculateSummary(userId, options);

    // A failed cache write must never prevent the response.
    try {
      await this.cache.set(userId, summary);
    } catch (error) {
      console.error("Recovery cache write failed", error);
    }

    return summary;
  }

  /**
   * Recalculates in the background and replaces the cached value.
   * Guarded by a per-user lock so concurrent requests near expiry don't all
   * recalculate. Never throws — a failed refresh must not affect the caller.
   */
  private async refreshInBackground(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<void> {
    let locked = false;
    try {
      locked = await this.cache.tryAcquireRefreshLock(userId);
      if (!locked) return; // another request is already refreshing

      await this.calculateAndCache(userId, options);
    } catch (error) {
      console.error("Recovery background refresh failed", error);
    } finally {
      if (locked) {
        await this.cache.releaseRefreshLock(userId);
      }
    }
  }

  /**
   * Returns the standardized recovery summary, served from Redis when cached.
   *
   * Flow: HIT → serve (refresh in background when near expiry);
   *       MISS → calculate → cache → serve.
   */
  async getRecoverySummary(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoverySummary> {
    // Non-canonical calculations (explicit reference time, date window, or
    // any configuration override) bypass the cache so a shared entry is
    // never polluted.
    if (options.now || options.config || options.since || options.fatigue) {
      return this.calculateSummary(userId, options);
    }

    let cached: CacheEntry<RecoverySummary> | null = null;
    try {
      cached = await this.cache.get(userId);
    } catch (error) {
      // A failed cache read must never prevent the calculation.
      console.error("Recovery cache read failed", error);
    }

    if (cached) {
      if (cached.ageMs >= getRecoveryRefreshThresholdMs()) {
        // Serve the still-usable value immediately, refresh behind it.
        void this.refreshInBackground(userId, options);
      }
      return cached.value;
    }

    return this.calculateAndCache(userId, options);
  }

  /**
   * Invalidates the cached recovery summary for a user.
   * Call this from any flow that changes data the calculation depends on
   * (workout completion, completed-workout data edits).
   */
  async invalidateRecovery(userId: string): Promise<void> {
    await this.cache.invalidate(userId);
  }

  /**
   * Per-muscle recovery timeline (Feature 6.3), served from Redis when cached.
   *
   * Every percentage is produced by the same calculator and inputs as the
   * summary, so the timeline never disagrees with the numbers shown in the
   * cards. The summary's refresh lock is reused, and invalidation clears both
   * cache entries.
   */
  async getRecoveryTimeline(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoveryTimelineItem[]> {
    if (options.now || options.config || options.since || options.fatigue) {
      return this.calculateTimeline(userId, options);
    }

    let cached: CacheEntry<RecoveryTimelineItem[]> | null = null;
    try {
      cached = await this.cache.getTimeline(userId);
    } catch (error) {
      console.error("Recovery timeline cache read failed", error);
    }

    if (cached) {
      if (cached.ageMs >= getRecoveryRefreshThresholdMs()) {
        void this.refreshTimelineInBackground(userId, options);
      }
      return cached.value;
    }

    return this.calculateAndCacheTimeline(userId, options);
  }

  /** Timeline calculation (identical inputs to the summary calculation). */
  private async calculateTimeline(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoveryTimelineItem[]> {
    const fatigues = await this.fatigue.getMuscleFatigue(
      userId,
      this.toFatigueOptions(options),
    );

    return new RecoveryCalculator(this.resolveConfig(options)).calculateTimeline(
      fatigues,
      options.now ?? new Date(),
    );
  }

  /** Calculates and caches. Used on timeline cache miss. */
  private async calculateAndCacheTimeline(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<RecoveryTimelineItem[]> {
    const items = await this.calculateTimeline(userId, options);

    try {
      await this.cache.setTimeline(userId, items);
    } catch (error) {
      console.error("Recovery timeline cache write failed", error);
    }

    return items;
  }

  /** Refreshes an aging timeline in the background, guarded by the user lock. */
  private async refreshTimelineInBackground(
    userId: string,
    options: RecoverySummaryOptions = {},
  ): Promise<void> {
    let locked = false;
    try {
      locked = await this.cache.tryAcquireRefreshLock(userId);
      if (!locked) return;

      await this.calculateAndCacheTimeline(userId, options);
    } catch (error) {
      console.error("Recovery timeline background refresh failed", error);
    } finally {
      if (locked) {
        await this.cache.releaseRefreshLock(userId);
      }
    }
  }
}

export const recoveryService = new RecoveryService();