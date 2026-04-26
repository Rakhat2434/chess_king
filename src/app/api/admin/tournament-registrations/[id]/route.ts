import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/adminGuard';
import { isValidObjectId, jsonError } from '@/lib/api';
import { sendTournamentStatusEmail, type TournamentStatusEmailStatus } from '@/lib/mailer';
import { TournamentRegistration } from '@/models/index';

const statusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'attended', 'cancelled']),
  adminNote: z.string().trim().max(500).optional().or(z.literal('')),
});

const notificationStatuses = new Set<TournamentStatusEmailStatus>(['approved', 'rejected', 'attended', 'cancelled']);

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id заявки', 400);

  const parsed = statusSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError('Некорректные данные заявки', 400);

  await connectDB();

  const registration = await TournamentRegistration.findById(params.id)
    .populate('user', 'name email')
    .populate({
      path: 'tournament',
      select: 'title slug startDate branch',
      populate: { path: 'branch', select: 'name city' },
    });

  if (!registration) return jsonError('Заявка не найдена', 404);

  registration.status = parsed.data.status;
  registration.adminNote = parsed.data.adminNote?.trim() || undefined;
  registration.updatedBy = session!.user.id as any;
  await registration.save();

  let emailWarning: string | null = null;

  if (notificationStatuses.has(parsed.data.status as TournamentStatusEmailStatus)) {
    try {
      const emailStatus = parsed.data.status as TournamentStatusEmailStatus;
      const user = registration.user as any;
      const tournament = registration.tournament as any;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || '';
      const tournamentUrl = tournament?.slug && siteUrl ? `${siteUrl}/tournaments/${tournament.slug}` : undefined;
      const result = await sendTournamentStatusEmail({
        to: user.email,
        userName: user.name,
        tournamentTitle: tournament.title,
        tournamentDate: tournament.startDate,
        status: emailStatus,
        adminNote: registration.adminNote,
        tournamentUrl,
      });

      if (!result.sent) emailWarning = result.warning || 'Письмо не отправлено';
    } catch (mailError) {
      console.error('Tournament registration email error:', mailError);
      emailWarning = 'Статус обновлен, но email не отправлен';
    }
  }

  const updated = await TournamentRegistration.findById(registration._id)
    .populate('user', 'name email')
    .populate({
      path: 'tournament',
      select: 'title slug startDate branch',
      populate: { path: 'branch', select: 'name city' },
    })
    .populate('updatedBy', 'name')
    .lean();

  return NextResponse.json({ item: updated, emailWarning });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!isValidObjectId(params.id)) return jsonError('Некорректный id заявки', 400);

  await connectDB();
  const deleted = await TournamentRegistration.findByIdAndDelete(params.id);
  if (!deleted) return jsonError('Заявка не найдена', 404);

  return NextResponse.json({ success: true });
}
