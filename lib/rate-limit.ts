/**
 * Minimal in-memory rate limiter for a single-instance deployment.
 * Good enough for a personal site's contact form / chat endpoint.
 * For multi-instance (serverless-at-scale) deployments, swap this for
 * @upstash/ratelimit backed by Upstash Redis — the call sites in
 * app/api/** already isolate rate limiting behind this one module.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

/** Best-effort client identifier from a Next.js Request (IP, falling back to a header). */
export function getClientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
