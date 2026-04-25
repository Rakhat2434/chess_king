import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { requireAdmin } from '@/lib/adminGuard';
import { createSlug } from '@/lib/utils';
import { getErrorMessage, jsonError } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const items = await Branch.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    await connectDB();
    const body = await req.json();
    const { name, address, city, phone, schedule } = body;
    if (
      typeof name !== 'string' ||
      typeof address !== 'string' ||
      typeof phone !== 'string' ||
      typeof schedule !== 'string' ||
      !name.trim() ||
      !address.trim() ||
      !phone.trim() ||
      !schedule.trim()
    ) {
      return jsonError('Заполните обязательные поля');
    }
    const baseSlug = createSlug(name) || `branch-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 2;
    while (await Branch.exists({ slug })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const branch = await Branch.create({
      name: name.trim(),
      slug,
      address: address.trim(),
      city: typeof city === 'string' && city.trim() ? city.trim() : 'Астана',
      phone: phone.trim(),
      whatsapp: typeof body.whatsapp === 'string' ? body.whatsapp.trim() : undefined,
      mapEmbed: typeof body.mapEmbed === 'string' ? body.mapEmbed.trim() : undefined,
      mapUrl: typeof body.mapUrl === 'string' ? body.mapUrl.trim() : undefined,
      schedule: schedule.trim(),
      image: typeof body.image === 'string' ? body.image.trim() : undefined,
      isActive: body.isActive !== false,
    });
    return NextResponse.json(branch, { status: 201 });
  } catch (err: unknown) {
    return jsonError(getErrorMessage(err), 500);
  }
}
