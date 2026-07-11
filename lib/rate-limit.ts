/**
 * In-memory fixed-window rate limiter. Good enough for a single-instance MVP;
 * doesn't share state across processes/instances. If this app ever runs on
 * more than one instance, swap the Map for Redis (e.g. INCR + EXPIRE) behind
 * the same `isAllowed` signature.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isAllowed(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}
