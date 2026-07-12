/**
 * Rate Limiter tối giản cho MVP demo
 *
 * Dùng in-memory Map (không cần Redis/database).
 * Tự động cleanup old entries mỗi 5 phút để tránh memory leak.
 *
 * ⚠️ Hạn chế: chỉ hoạt động trên 1 instance server.
 * Vercel Serverless mỗi request là 1 cold start → rate limit reset.
 * Phase 2 nên chuyển sang Vercel KV hoặc Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 phút

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

/**
 * Kiểm tra rate limit cho 1 key (thường là IP hoặc session ID).
 *
 * @param key - Định danh unique (IP, session, user ID)
 * @param maxRequests - Số request tối đa trong window
 * @param windowMs - Độ dài window (ms), VD: 60_000 = 1 phút
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  // Cleanup old entries mỗi 5 phút
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    cleanupExpiredEntries(now);
    lastCleanup = now;
  }

  const entry = store.get(key);

  // Chưa có entry hoặc window đã hết → tạo mới
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetInMs: windowMs };
  }

  // Trong window hiện tại
  const resetInMs = windowMs - (now - entry.windowStart);

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetInMs };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetInMs };
}

function cleanupExpiredEntries(now: number): void {
  const MAX_AGE = 60 * 60 * 1000; // 1 giờ
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > MAX_AGE) {
      store.delete(key);
    }
  }
}

/**
 * Helper để lấy client IP từ Next.js request.
 * Trên Vercel, dùng x-forwarded-for header.
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'anonymous';
}

/**
 * Preset rate limits theo endpoint.
 * Xem docs/references/tech_constraints.md section 6.3.
 */
export const RATE_LIMITS = {
  ANALYZE: { max: 3, windowMs: 60_000 },    // 3 request/phút cho AI-1
  CHAT: { max: 5, windowMs: 60_000 },       // 5 request/phút cho AI-2
  LEAD: { max: 10, windowMs: 3600_000 },    // 10 lead/giờ (phòng phase 2)
} as const;
