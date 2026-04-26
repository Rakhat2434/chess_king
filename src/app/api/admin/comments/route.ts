import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TournamentComment } from '@/models/index';
import { requireAdmin } from '@/lib/adminGuard';
import { parsePagination } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  await connectDB();
  const { searchParams } = new URL(req.url);
  const { page, limit, skip } = parsePagination(searchParams, { defaultLimit: 30 });

  const [items, total] = await Promise.all([
    TournamentComment.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('tournament', 'title slug')
      .lean(),
    TournamentComment.countDocuments({ isDeleted: { $ne: true } }),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}
