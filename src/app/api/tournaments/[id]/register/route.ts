import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/adminGuard';
import { isValidObjectId, jsonError } from '@/lib/api';
import Tournament from '@/models/Tournament';
import { TournamentRegistration } from '@/models/index';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (!isValidObjectId(params.id)) {
    return jsonError('Некорректный id турнира', 400);
  }

  try {
    await connectDB();

    const tournament = await Tournament.findOne({ _id: params.id, isPublished: true });
    if (!tournament) return jsonError('Турнир не найден', 404);
    if (tournament.status === 'completed') {
      return jsonError('Регистрация на завершенный турнир закрыта', 409);
    }

    const existing = await TournamentRegistration.findOne({
      user: session!.user.id,
      tournament: params.id,
    });

    if (existing) {
      return NextResponse.json({
        id: existing._id.toString(),
        status: existing.status,
        alreadyExists: true,
      });
    }

    const registration = await TournamentRegistration.create({
      user: session!.user.id,
      tournament: params.id,
      status: 'pending',
    });

    return NextResponse.json(
      { id: registration._id.toString(), status: registration.status, alreadyExists: false },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'code' in err && err.code === 11000) {
      const existing = await TournamentRegistration.findOne({
        user: session!.user.id,
        tournament: params.id,
      });
      return NextResponse.json({
        id: existing?._id.toString(),
        status: existing?.status || 'pending',
        alreadyExists: true,
      });
    }

    console.error('Tournament registration error:', err);
    return jsonError('Ошибка сервера', 500);
  }
}
