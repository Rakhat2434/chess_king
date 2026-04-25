import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError, parsePagination } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = parsePagination(searchParams, { defaultLimit: 20 });

  const [items, total] = await Promise.all([
    Tournament.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('branch', 'name')
      .lean(),
    Tournament.countDocuments(),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  try {
    await connectDB();
    const body = await req.json();
    const { title, description, startDate, branch } = body;

    if (
      typeof title !== 'string' ||
      typeof description !== 'string' ||
      !title.trim() ||
      !description.trim() ||
      !startDate ||
      !isValidObjectId(branch)
    ) {
      return jsonError('Заполните обязательные поля');
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = body.endDate ? new Date(body.endDate) : undefined;
    if (Number.isNaN(parsedStartDate.getTime())) {
      return jsonError('Некорректная дата начала');
    }
    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
      return jsonError('Некорректная дата окончания');
    }
    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      return jsonError('Дата окончания не может быть раньше даты начала');
    }

    const baseSlug = createSlug(title) || `tournament-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await Tournament.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const tournament = await Tournament.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      coverImage: typeof body.coverImage === 'string' && body.coverImage.trim() ? body.coverImage.trim() : undefined,
      gallery: Array.isArray(body.gallery) ? body.gallery.filter(Boolean) : [],
      status: ['upcoming', 'ongoing', 'completed'].includes(body.status) ? body.status : 'upcoming',
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      branch,
      location: typeof body.location === 'string' ? body.location.trim() : undefined,
      prizes: Array.isArray(body.prizes) ? body.prizes : [],
      isPublished: !!body.isPublished,
      createdBy: session!.user.id,
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}
