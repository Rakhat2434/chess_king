import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/adminGuard';
import { jsonError } from '@/lib/api';
import { TournamentRegistration } from '@/models/index';

const statuses = ['pending', 'approved', 'rejected', 'attended', 'cancelled'];

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const filter: Record<string, string> = {};

  if (status) {
    if (!statuses.includes(status)) return jsonError('Недопустимый статус', 400);
    filter.status = status;
  }

  const items = await TournamentRegistration.find(filter)
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate({
      path: 'tournament',
      select: 'title slug startDate branch',
      populate: { path: 'branch', select: 'name city' },
    })
    .populate('updatedBy', 'name')
    .lean();

  return NextResponse.json({ items });
}
