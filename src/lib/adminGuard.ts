import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      error: NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 }),
      session: null,
    };
  }

  if (session.user.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Нет доступа' }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}
