import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import Tournament from '@/models/Tournament';
import { Enrollment } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug, getGoogleMapsEmbedSrc } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id филиала', 400);

  await connectDB();
  try {
    const existing = await Branch.findById(params.id);
    if (!existing) return jsonError('Не найдено', 404);

    const body = await req.json();
    const update: Record<string, unknown> = {};
    const unset: Record<string, ''> = {};

    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) return jsonError('Название обязательно');
      update.name = name;
      if (name !== existing.name) {
        const baseSlug = createSlug(name) || `branch-${Date.now()}`;
        let slug = baseSlug;
        let suffix = 2;
        while (await Branch.exists({ slug, _id: { $ne: params.id } })) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        update.slug = slug;
      }
    }
    if (typeof body.address === 'string') {
      if (!body.address.trim()) return jsonError('Адрес обязателен');
      update.address = body.address.trim();
    }
    if (typeof body.phone === 'string') {
      if (!body.phone.trim()) return jsonError('Телефон обязателен');
      update.phone = body.phone.trim();
    }
    if (typeof body.schedule === 'string') {
      if (!body.schedule.trim()) return jsonError('Расписание обязательно');
      update.schedule = body.schedule.trim();
    }
    if (typeof body.city === 'string') update.city = body.city.trim() || 'Астана';
    if (typeof body.whatsapp === 'string') {
      const whatsapp = body.whatsapp.trim();
      if (whatsapp) update.whatsapp = whatsapp;
      else unset.whatsapp = '';
    }
    if (typeof body.mapEmbed === 'string') {
      const mapEmbed = body.mapEmbed.trim();
      if (mapEmbed) {
        update.mapEmbed = getGoogleMapsEmbedSrc(mapEmbed, [
          typeof update.address === 'string' ? update.address : existing.address,
          typeof update.city === 'string' ? update.city : existing.city,
        ]);
      }
      else unset.mapEmbed = '';
    }
    if (typeof body.mapUrl === 'string') {
      const mapUrl = body.mapUrl.trim();
      if (mapUrl) update.mapUrl = mapUrl;
      else unset.mapUrl = '';
    }
    if (typeof body.image === 'string') {
      const image = body.image.trim();
      if (image) update.image = image;
      else unset.image = '';
    }
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive;

    const branch = await Branch.findByIdAndUpdate(params.id, {
      $set: update,
      ...(Object.keys(unset).length ? { $unset: unset } : {}),
    }, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(branch);
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id филиала', 400);

  await connectDB();
  const [coaches, tournaments, enrollments] = await Promise.all([
    Coach.countDocuments({ branch: params.id }),
    Tournament.countDocuments({ branch: params.id }),
    Enrollment.countDocuments({ branch: params.id }),
  ]);
  if (coaches || tournaments || enrollments) {
    return jsonError('Нельзя удалить филиал, пока к нему привязаны тренеры, турниры или заявки', 409);
  }

  const branch = await Branch.findByIdAndDelete(params.id);
  if (!branch) return jsonError('Не найдено', 404);
  return NextResponse.json({ success: true });
}
