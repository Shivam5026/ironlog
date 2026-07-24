import { redis } from "../config/redis";

export async function getCache<T>(
  key: string
): Promise<T | null> {
  const data = await redis.get(key);

  if (!data) return null;

  return JSON.parse(data) as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttl = 3600
) {
  console.log("💾 Saving to Redis:", key);

  await redis.set(key, JSON.stringify(value), {
    EX: ttl,
  });
}

export async function deleteCache(
  key: string
) {
  await redis.del(key);
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600
): Promise<T> {
  const cached = await getCache<T>(key);

   if (cached) {
    console.log(`🟢 Cache HIT: ${key}`);
    return cached;
  }

  console.log(`🔴 Cache MISS: ${key}`);

  const fresh = await fetcher();

  await setCache(key, fresh, ttl);

  console.log(`💾 Cached: ${key}`);

  return fresh;
}