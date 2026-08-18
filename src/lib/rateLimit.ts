const buckets = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;

export function isRateLimited(key: string, maxAttempts = 10): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= maxAttempts) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
