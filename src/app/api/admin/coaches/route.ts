import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Coach from '@/models/Coach';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, isValidObjectId, jsonError } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const items = await Coach.find().sort({ order: 1 }).populate('branch', 'name').lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    const { name, title, bio, experience, branch } = body;
    if (
      typeof name !== 'string' ||
      typeof title !== 'string' ||
      typeof bio !== 'string' ||
      !name.trim() ||
      !title.trim() ||
      !bio.trim() ||
      !isValidObjectId(branch)
    ) {
      return jsonError('Заполните обязательные поля');
    }

    const parsedExperience = Number(experience ?? 0);
    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      return jsonError('Опыт должен быть положительным числом');
    }

    const baseSlug = createSlug(name) || `coach-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await Coach.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const coach = await Coach.create({
      name: name.trim(),
      slug,
      photo: typeof body.photo === 'string' ? body.photo.trim() : undefined,
      title: title.trim(),
      bio: bio.trim(),
      experience: parsedExperience,
      achievements: Array.isArray(body.achievements) ? body.achievements.filter(Boolean) : [],
      specialization: Array.isArray(body.specialization) ? body.specialization.filter(Boolean) : [],
      branch,
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      isActive: body.isActive !== false,
    });
    return NextResponse.json(coach, { status: 201 });
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}
