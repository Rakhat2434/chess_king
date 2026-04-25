import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coach from '@/models/Coach';
import { Enrollment } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id тренера', 400);

  await connectDB();
  try {
    const existing = await Coach.findById(params.id);
    if (!existing) return jsonError('Не найдено', 404);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    const unset: Record<string, ''> = {};

    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) return jsonError('Имя обязательно');
      update.name = name;
      if (name !== existing.name) {
        const baseSlug = createSlug(name) || `coach-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 2;
        while (await Coach.exists({ slug, _id: { $ne: params.id } })) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        update.slug = slug;
      }
    }
    if (typeof body.title === 'string') {
      if (!body.title.trim()) return jsonError('Звание обязательно');
      update.title = body.title.trim();
    }
    if (typeof body.bio === 'string') {
      if (!body.bio.trim()) return jsonError('Биография обязательна');
      update.bio = body.bio.trim();
    }
    if (body.branch !== undefined) {
      if (!isValidObjectId(body.branch)) return jsonError('Некорректный филиал');
      update.branch = body.branch;
    }
    if (body.experience !== undefined) {
      const experience = Number(body.experience);
      if (!Number.isFinite(experience) || experience < 0) return jsonError('Опыт должен быть положительным числом');
      update.experience = experience;
    }
    if (typeof body.photo === 'string') {
      const photo = body.photo.trim();
      if (photo) update.photo = photo;
      else unset.photo = '';
    }
    if (Array.isArray(body.achievements)) update.achievements = body.achievements.filter(Boolean);
    if (Array.isArray(body.specialization)) update.specialization = body.specialization.filter(Boolean);
    if (body.order !== undefined) update.order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;

    const coach = await Coach.findByIdAndUpdate(params.id, {
      $set: update,
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(coach);
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id тренера', 400);

  await connectDB();
  const enrollments = await Enrollment.countDocuments({ coach: params.id });
  if (enrollments > 0) {
    return jsonError('Нельзя удалить тренера, пока к нему привязаны заявки', 409);
  }

  const coach = await Coach.findByIdAndDelete(params.id);
  if (!coach) return jsonError('Не найдено', 404);
  return NextResponse.json({ success: true });
}
