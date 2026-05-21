import NextAuth from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/security';

const handler = NextAuth(authOptions);
export { handler as GET };

export async function POST(req: NextRequest, context: { params: { nextauth: string[] } }) {
  const limited = await rateLimit(req, {
    keyPrefix: 'auth:nextauth',
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  return handler(req, context);
}
