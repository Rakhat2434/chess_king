import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/adminGuard';
import { TournamentRegistration } from '@/models/index';

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  await connectDB();

  const registrations = await TournamentRegistration.find({ user: session!.user.id })
    .sort({ createdAt: -1 })
    .populate({
      path: 'tournament',
      select: 'title slug startDate endDate status branch',
      populate: { path: 'branch', select: 'name city' },
    })
    .lean();

  return NextResponse.json(registrations);
}
