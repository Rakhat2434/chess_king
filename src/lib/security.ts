import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import connectDB from './db';
import RateLimit from '@/models/RateLimit';

export { validatePasswordPolicy } from './validators';

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  identifier?: string;
};

type RateLimitResult = {
  limited: boolean;
  retryAfter: number;
};

export function getClientIp(req: NextRequest): string {
  return getClientIpFromHeaders(req.headers);
}

export function getClientIpFromHeaders(
  headers: Headers | Record<string, string | string[] | undefined> | undefined
): string {
  const getHeader = (name: string) => {
    if (!headers) return undefined;
    if (headers instanceof Headers) return headers.get(name) || undefined;

    const value = headers[name] || headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const vercelIp = getHeader('x-vercel-forwarded-for')?.split(',')[0]?.trim();
  const cfIp = getHeader('cf-connecting-ip')?.trim();
  const realIp = getHeader('x-real-ip')?.trim();
  const forwardedFor = getHeader('x-forwarded-for')?.split(',')[0]?.trim();

  return vercelIp || cfIp || realIp || forwardedFor || 'unknown';
}

export async function rateLimit(req: NextRequest, options: RateLimitOptions): Promise<NextResponse | null> {
  const result = await checkRateLimit({
    ...options,
    identifier: options.identifier || getClientIp(req),
  });

  if (!result.limited) return null;

  return NextResponse.json(
    { error: 'Слишком много попыток. Попробуйте позже.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfter),
      },
    }
  );
}

export async function checkRateLimit(options: RateLimitOptions & { identifier: string }): Promise<RateLimitResult> {
  const now = Date.now();
  const nowDate = new Date(now);
  const resetAt = new Date(now + options.windowMs);
  const key = getRateLimitKey(options.keyPrefix, options.identifier);

  await connectDB();

  const existing = await RateLimit.findOne({ key });

  if (!existing || existing.resetAt.getTime() <= now) {
    try {
      await RateLimit.findOneAndUpdate(
        { key },
        { $set: { count: 1, resetAt } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err: unknown) {
      if (!(typeof err === 'object' && err && 'code' in err && err.code === 11000)) {
        throw err;
      }
    }

    return { limited: false, retryAfter: 0 };
  }

  if (existing.count >= options.limit) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000)),
    };
  }

  const updated = await RateLimit.findOneAndUpdate(
    { key, resetAt: { $gt: nowDate }, count: { $lt: options.limit } },
    { $inc: { count: 1 } },
    { new: true }
  );

  if (!updated) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt.getTime() - now) / 1000)),
    };
  }

  return { limited: false, retryAfter: 0 };
}

export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function getRateLimitKey(keyPrefix: string, identifier: string): string {
  const digest = createHash('sha256').update(identifier).digest('hex');
  return `${keyPrefix}:${digest}`;
}
