import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import { TournamentComment, TournamentVisit } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id турнира', 400);

  try {
    await connectDB();
    const existing = await Tournament.findById(params.id);
    if (!existing) return jsonError('Не найдено', 404);

    const body = await req.json();

    const update: Record<string, unknown> = {
      updatedBy: session!.user.id,
    };
    const unset: Record<string, ''> = {};

    if (typeof body.title === 'string') {
      const title = body.title.trim();
      if (!title) return jsonError('Название обязательно');
      update.title = title;
      if (title !== existing.title) {
        const baseSlug = createSlug(title) || `tournament-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 2;
        while (await Tournament.exists({ slug, _id: { $ne: params.id } })) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        update.slug = slug;
      }
    }
    if (typeof body.description === 'string') {
      if (!body.description.trim()) return jsonError('Описание обязательно');
      update.description = body.description.trim();
    }
    if (body.branch !== undefined) {
      if (!isValidObjectId(body.branch)) return jsonError('Некорректный филиал');
      update.branch = body.branch;
    }
    if (body.startDate) {
      const startDate = new Date(body.startDate);
      if (Number.isNaN(startDate.getTime())) return jsonError('Некорректная дата начала');
      update.startDate = startDate;
    }
    if (body.endDate !== undefined) {
      if (!body.endDate) {
        unset.endDate = '';
      } else {
        const endDate = new Date(body.endDate);
        if (Number.isNaN(endDate.getTime())) return jsonError('Некорректная дата окончания');
        update.endDate = endDate;
      }
    }
    const nextStartDate = (update.startDate as Date | undefined) ?? existing.startDate;
    const nextEndDate = unset.endDate ? undefined : (update.endDate as Date | undefined) ?? existing.endDate;
    if (nextEndDate && nextEndDate < nextStartDate) {
      return jsonError('Дата окончания не может быть раньше даты начала');
    }
    if (typeof body.coverImage === 'string') {
      const coverImage = body.coverImage.trim();
      if (coverImage) update.coverImage = coverImage;
      else unset.coverImage = '';
    }
    if (Array.isArray(body.gallery)) update.gallery = body.gallery.filter(Boolean);
    if (['upcoming', 'ongoing', 'completed'].includes(body.status)) update.status = body.status;
    if (typeof body.location === 'string') {
      const location = body.location.trim();
      if (location) update.location = location;
      else unset.location = '';
    }
    if (Array.isArray(body.prizes)) update.prizes = body.prizes;
    if (typeof body.isPublished === 'boolean') update.isPublished = body.isPublished;

    const tournament = await Tournament.findByIdAndUpdate(params.id, {
      $set: update,
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(tournament);
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id турнира', 400);

  await connectDB();
  const tournament = await Tournament.findByIdAndDelete(params.id);
  if (!tournament) return jsonError('Не найдено', 404);
  await Promise.all([
    TournamentComment.deleteMany({ tournament: params.id }),
    TournamentVisit.deleteMany({ tournament: params.id }),
  ]);
  return NextResponse.json({ success: true });
}
