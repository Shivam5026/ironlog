import { redis, isRedisAvailable } from "../config/redis";

export async function getCache<T>(
  key: string
): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttl = 3600
) {
  if (!isRedisAvailable()) return;
  try {
    await redis.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch {
    // Redis failure should not break the application
  }
}

export async function deleteCache(
  key: string
) {
  if (!isRedisAvailable()) return;
  try {
    await redis.del(key);
  } catch {
    // Redis failure should not break the application
  }
}

export async function deleteCacheByPattern(
  pattern: string
) {
  if (!isRedisAvailable()) return;
  try {
    let cursor: string | undefined;
    do {
      const result = await redis.scan(cursor ?? "0", { MATCH: pattern, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length > 0) {
        await redis.del(result.keys);
      }
    } while (cursor !== "0");
  } catch {
    // Redis failure should not break the application
  }
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await getCache<T>(key);

  if (cached) {
    return cached;
  }

  const fresh = await fetcher();

  await setCache(key, fresh, ttl);

  return fresh;
}

// ── Soft TTL / Background Refresh Support ──────────────────────────
//
// Values written by setCacheWithTimestamp carry their write time so callers
// can decide whether an entry is still comfortably fresh (serve it) or is
// approaching expiry (serve it, but refresh in the background) without
// blocking the request.

const CACHE_ENVELOPE_MARKER = "__cachedAt";

export interface CacheEntry<T> {
  value: T;
  /** Milliseconds since the entry was written. */
  ageMs: number;
}

export async function setCacheWithTimestamp<T>(
  key: string,
  value: T,
  ttl = 3600
) {
  if (!isRedisAvailable()) return;
  try {
    await redis.set(key, JSON.stringify({ [CACHE_ENVELOPE_MARKER]: Date.now(), value }), {
      EX: ttl,
    });
  } catch {
    // Redis failure should not break the application
  }
}

export async function getCacheWithAge<T>(key: string): Promise<CacheEntry<T> | null> {
  if (!isRedisAvailable()) return null;
  try {
    const raw = await redis.get(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Only treat as an envelope when the marker is a valid timestamp.
    if (parsed && typeof parsed[CACHE_ENVELOPE_MARKER] === "number") {
      const ageMs = Math.max(0, Date.now() - (parsed[CACHE_ENVELOPE_MARKER] as number));
      return { value: parsed.value as T, ageMs };
    }

    // Written by plain setCache — usable, but age is unknown.
    return { value: parsed as T, ageMs: Number.POSITIVE_INFINITY };
  } catch {
    return null;
  }
}

// ── Lightweight Refresh Lock ───────────────────────────────────────
//
// Prevents a thundering herd of concurrent background refreshes for the same
// key. Intentionally minimal: a short-lived SET NX flag, not a distributed
// lock implementation.

export async function acquireCacheLock(
  key: string,
  ttl = 10
): Promise<boolean> {
  if (!isRedisAvailable()) return false;
  try {
    const result = await redis.set(key, "1", { NX: true, EX: ttl });
    return result === "OK";
  } catch {
    return false;
  }
}

export async function releaseCacheLock(key: string): Promise<void> {
  await deleteCache(key);
}
