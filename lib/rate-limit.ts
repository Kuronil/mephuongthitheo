// Simple in-memory rate limiter using fixed window counters
// Note: For production, prefer Redis-based ratelimiting (e.g., Upstash)

type Counter = {
  count: number
  windowStart: number
}

const counters = new Map<string, Counter>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for')
  if (xff) {
    // x-forwarded-for may contain multiple comma-separated IPs
    return xff.split(',')[0].trim()
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Fixed-window rate limiter
 * @param key Unique key per client (e.g., IP or IP+route)
 * @param limit Max requests allowed within the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = counters.get(key)

  if (!existing) {
    counters.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 }
  }

  const elapsed = now - existing.windowStart
  if (elapsed > windowMs) {
    // Reset window
    counters.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 }
  }

  if (existing.count < limit) {
    existing.count += 1
    return { allowed: true, remaining: limit - existing.count, retryAfterSec: 0 }
  }

  // Over limit
  const retryAfterMs = windowMs - elapsed
  return {
    allowed: false,
    remaining: 0,
    retryAfterSec: Math.ceil(retryAfterMs / 1000),
  }
}

/**
 * Convenience for auth endpoints: stricter defaults.
 * Defaults: 5 requests per 60 seconds per IP per route.
 */
export function checkAuthRateLimit(headers: Headers, route: string, limit = 5, windowSec = 60): RateLimitResult {
  const ip = getClientIpFromHeaders(headers)
  const key = `auth:${route}:${ip}`
  return checkRateLimit(key, limit, windowSec * 1000)
}
