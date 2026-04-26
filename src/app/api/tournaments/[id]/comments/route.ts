import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { TournamentComment } from '@/models/index';
import Tournament from '@/models/Tournament';
import { isValidObjectId, jsonError } from '@/lib/api';
import { getClientIp, isHoneypotFilled, rateLimit } from '@/lib/security';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return jsonError('Требуется авторизация', 401);
    if (!isValidObjectId(params.id)) return jsonError('Некорректный id турнира', 400);

    const limited = rateLimit(req, {
      keyPrefix: 'comments',
      limit: 10,
      windowMs: 10 * 60 * 1000,
      identifier: `${session.user.id}:${getClientIp(req)}`,
    });
    if (limited) return limited;

    const { text, website } = await req.json();

    if (isHoneypotFilled(website)) {
      return NextResponse.json({ success: true, skipped: true }, { status: 202 });
    }
    if (typeof text !== 'string' || !text.trim()) return jsonError('Текст не может быть пустым');
    if (text.trim().length > 1000) return jsonError('Слишком длинный комментарий');

    await connectDB();

    const tournament = await Tournament.findById(params.id);
    if (!tournament || !tournament.isPublished) return jsonError('Турнир не найден', 404);

    const comment = await TournamentComment.create({
      tournament: params.id,
      user: session.user.id,
      content: text.trim(),
      text: text.trim(),
      isVisible: true,
    });

    const populated = await comment.populate('user', 'name');
    return NextResponse.json(populated, { status: 201 });
  } catch {
    return jsonError('Ошибка сервера', 500);
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isValidObjectId(params.id)) return jsonError('Некорректный id турнира', 400);
    await connectDB();
    const comments = await TournamentComment.find({
      tournament: params.id,
      isVisible: true,
      isDeleted: { $ne: true },
    }).populate('user', 'name').sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json(comments);
  } catch {
    return jsonError('Ошибка сервера', 500);
  }
}
