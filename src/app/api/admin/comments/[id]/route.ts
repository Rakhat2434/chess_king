import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TournamentComment } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { isValidObjectId, jsonError } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id комментария', 400);

  await connectDB();
  const { isVisible } = await req.json();
  if (typeof isVisible !== 'boolean') return jsonError('Некорректное значение видимости');

  const comment = await TournamentComment.findByIdAndUpdate(
    params.id,
    { isVisible },
    { new: true }
  );
  if (!comment) return jsonError('Не найдено', 404);
  return NextResponse.json(comment);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id комментария', 400);

  await connectDB();
  const comment = await TournamentComment.findByIdAndDelete(params.id);
  if (!comment) return jsonError('Не найдено', 404);
  return NextResponse.json({ success: true });
}
