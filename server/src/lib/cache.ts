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
