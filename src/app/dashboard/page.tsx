import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Enrollment, TournamentComment, TournamentRegistration } from '@/models/index';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

export const dynamic = 'force-dynamic';

const statusLabel: Record<string, { label: string; color: string }> = {
  new: { label: 'Новая', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'В обработке', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Подтверждена', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменена', color: 'bg-red-100 text-red-700' },
};

const tournamentStatusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: 'Заявка отправлена', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Участие подтверждено', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отказано', color: 'bg-red-100 text-red-700' },
  attended: { label: 'Участвовал', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Отменено', color: 'bg-gray-100 text-gray-600' },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;
  await connectDB();

  const [enrollments, comments, tournamentRegistrations] = await Promise.all([
    Enrollment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('branch', 'name')
      .populate('coach', 'name')
      .lean(),
    TournamentComment.find({ user: userId, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .populate('tournament', 'title slug')
      .lean(),
    TournamentRegistration.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'tournament',
        select: 'title slug startDate endDate branch',
        populate: { path: 'branch', select: 'name city' },
      })
      .lean(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="bg-royal-gradient chess-bg py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-2">Личный кабинет</p>
            <h1 className="font-display text-3xl font-bold text-white">
              Добро пожаловать, {session.user?.name?.split(' ')[0]}!
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <DashboardTabs
            enrollments={JSON.parse(JSON.stringify(enrollments))}
            comments={JSON.parse(JSON.stringify(comments))}
            tournamentRegistrations={JSON.parse(JSON.stringify(tournamentRegistrations))}
            statusLabel={statusLabel}
            tournamentStatusLabel={tournamentStatusLabel}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
