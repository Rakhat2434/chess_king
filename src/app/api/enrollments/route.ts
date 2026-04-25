import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Enrollment } from '@/models/index';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import { isValidObjectId, jsonError } from '@/lib/api';
import { isHoneypotFilled, rateLimit } from '@/lib/security';

const enrollmentStatuses = ['new', 'processing', 'confirmed', 'cancelled'];
const levels = ['beginner', 'intermediate', 'advanced'];

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
    keyPrefix: 'enrollments',
    limit: 3,
    windowMs: 30 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (isHoneypotFilled(body.website)) {
      return NextResponse.json({ success: true });
    }

    const { parentName, phone, branchId, preferredTime, level } = body;
    if (
      typeof parentName !== 'string' ||
      typeof phone !== 'string' ||
      typeof preferredTime !== 'string' ||
      !parentName.trim() ||
      !phone.trim() ||
      !preferredTime.trim() ||
      !isValidObjectId(branchId) ||
      !levels.includes(level)
    ) {
      return jsonError('Заполните обязательные поля');
    }

    if (body.coachId && !isValidObjectId(body.coachId)) {
      return jsonError('Некорректный тренер');
    }

    const age = body.age === '' || body.age === undefined ? undefined : Number(body.age);
    if (age !== undefined && (!Number.isFinite(age) || age < 4 || age > 99)) {
      return jsonError('Некорректный возраст');
    }

    await connectDB();
    const branch = await Branch.findOne({ _id: branchId, isActive: true });
    if (!branch) return jsonError('Филиал не найден', 404);

    if (body.coachId) {
      const coach = await Coach.findOne({ _id: body.coachId, branch: branchId, isActive: true });
      if (!coach) return jsonError('Тренер не найден в выбранном филиале', 404);
    }

    const enrollment = await Enrollment.create({
      user: session?.user?.id || undefined,
      parentName: parentName.trim(),
      studentName: typeof body.studentName === 'string' ? body.studentName.trim() : undefined,
      age,
      phone: phone.trim(),
      branch: branchId,
      coach: body.coachId || undefined,
      preferredTime: preferredTime.trim(),
      level,
      comment: typeof body.comment === 'string' ? body.comment.trim() : undefined,
      status: 'new',
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (err: unknown) {
    console.error('Enrollment error:', err);
    return jsonError('Ошибка сервера', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonError('Требуется авторизация', 401);
    }
    if (session.user.role !== 'admin') {
      return jsonError('Нет доступа', 403);
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const filter: Record<string, string> = {};
    if (status) {
      if (!enrollmentStatuses.includes(status)) return jsonError('Недопустимый статус');
      filter.status = status;
    }

    const enrollments = await Enrollment.find(filter)
      .sort({ createdAt: -1 })
      .populate('branch', 'name')
      .populate('coach', 'name')
      .lean();

    return NextResponse.json(enrollments);
  } catch {
    return jsonError('Ошибка сервера', 500);
  }
}
