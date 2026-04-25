import { NextRequest, NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  identifier?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var chesskingRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

// In-memory rate limiting works for local development and small Vercel deployments.
// For production-grade global limits, replace this store with Upstash Redis.
const rateLimitStore = globalThis.chesskingRateLimitStore ?? new Map<string, RateLimitEntry>();

if (!globalThis.chesskingRateLimitStore) {
  globalThis.chesskingRateLimitStore = rateLimitStore;
}

export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = req.headers.get('x-real-ip')?.trim();
  const vercelIp = req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();

  return forwardedFor || realIp || vercelIp || cfIp || 'unknown';
}

export function rateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }

  const identifier = options.identifier || getClientIp(req);
  const key = `${options.keyPrefix}:${identifier}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

    return NextResponse.json(
      { error: 'Слишком много попыток. Попробуйте позже.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  existing.count += 1;
  return null;
}

export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validatePasswordPolicy(password: string): string | null {
  if (password.length < 8) {
    return 'Пароль должен содержать минимум 8 символов.';
  }

  if (!/[A-Za-zА-Яа-яЁё]/.test(password)) {
    return 'Пароль должен содержать минимум 1 букву.';
  }

  if (!/\d/.test(password)) {
    return 'Пароль должен содержать минимум 1 цифру.';
  }

  return null;
}
