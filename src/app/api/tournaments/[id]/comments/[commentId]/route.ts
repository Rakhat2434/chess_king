import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/adminGuard';
import { isValidObjectId, jsonError } from '@/lib/api';
import { TournamentComment } from '@/models/index';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (!isValidObjectId(params.id) || !isValidObjectId(params.commentId)) {
    return jsonError('Некорректный id комментария', 400);
  }

  await connectDB();

  const comment = await TournamentComment.findOne({
    _id: params.commentId,
    tournament: params.id,
    isDeleted: { $ne: true },
  });

  if (!comment) return jsonError('Комментарий не найден', 404);

  const isOwner = comment.user.toString() === session!.user.id;
  const isAdmin = session!.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return jsonError('Нельзя удалить чужой комментарий', 403);
  }

  comment.isDeleted = true;
  comment.deletedAt = new Date();
  comment.deletedBy = session!.user.id as any;
  comment.isVisible = false;
  await comment.save();

  return NextResponse.json({ success: true });
}
