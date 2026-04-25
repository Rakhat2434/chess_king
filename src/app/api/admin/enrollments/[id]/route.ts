import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Enrollment } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { isValidObjectId, jsonError } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id заявки', 400);

  await connectDB();
  const { status } = await req.json();
  const validStatuses = ['new', 'processing', 'confirmed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return jsonError('Недопустимый статус');
  }
  const enrollment = await Enrollment.findByIdAndUpdate(params.id, { status }, { new: true });
  if (!enrollment) return jsonError('Не найдено', 404);
  return NextResponse.json(enrollment);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;
  if (!isValidObjectId(params.id)) return jsonError('Некорректный id заявки', 400);

  await connectDB();
  const enrollment = await Enrollment.findByIdAndDelete(params.id);
  if (!enrollment) return jsonError('Не найдено', 404);
  return NextResponse.json({ success: true });
}
