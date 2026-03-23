type RateLimitResult = { allowed: true } | { allowed: false; retryAfter: number };

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const store = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return { allowed: true };
  }

  const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
  return { allowed: false, retryAfter };
}

export function _resetStore(): void {
  store.clear();
}
