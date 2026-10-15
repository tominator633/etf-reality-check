import "server-only";

// Rate limit v paměti instance (tech-spec 7.2: 5 požadavků / 10 min / IP). Best effort:
// na Vercelu má každá instance vlastní paměť – omezení je v README.

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({ max, windowMs } = RATE_LIMIT) {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now: number): boolean {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    // Ochrana paměti: při velkém počtu klíčů zahodí nejstarší.
    if (hits.size > MAX_TRACKED_KEYS) hits.delete(hits.keys().next().value!);
    return true;
  };
}

/** IP klienta z hlaviček proxy (Vercel: x-forwarded-for, první položka). Neukládá se. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
