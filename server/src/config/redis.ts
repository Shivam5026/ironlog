import { createClient } from "redis";

/**
 * Redis is an optional optimization layer, not a hard dependency.
 * When Redis is unavailable the application falls back to PostgreSQL.
 */

export const REDIS_ENABLED = process.env.REDIS_ENABLED !== "false";

export const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    // Back off progressively and give up eventually instead of retrying forever
    reconnectStrategy(retries) {
      if (retries > 10) {
        return new Error("Redis: max reconnect attempts reached");
      }
      return Math.min(retries * 200, 3000);
    },
  },
});

// Only log the transition to "unavailable" once to avoid log spam while retrying
let warnedUnavailable = false;

redis.on("error", () => {
  if (!warnedUnavailable) {
    warnedUnavailable = true;
    console.warn(
      "⚠️  Redis unavailable — running without cache. Analytics fall back to PostgreSQL.",
    );
  }
});

redis.on("ready", () => {
  if (warnedUnavailable) {
    console.log("✅ Redis Connected (recovered)");
  } else {
    console.log("✅ Redis Connected");
  }
  warnedUnavailable = false;
});

export async function connectRedis(): Promise<boolean> {
  if (!REDIS_ENABLED) {
    console.log("⏭️  Redis disabled (REDIS_ENABLED=false) — running without cache");
    return false;
  }

  if (redis.isOpen) return true;

  try {
    await redis.connect();
    return true;
  } catch {
    warnedUnavailable = true;
    return false;
  }
}

/** True only when Redis is connected and able to serve commands. */
export function isRedisAvailable(): boolean {
  return REDIS_ENABLED && redis.isReady;
}
