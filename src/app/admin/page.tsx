import connectDB from '@/lib/db';
import News from '@/models/News';
import Tournament from '@/models/Tournament';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import { Enrollment, TournamentComment, TournamentRegistration } from '@/models/index';
import { Newspaper, Trophy, MapPin, Users, ClipboardList, MessageSquare, TrendingUp, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await connectDB();

  const [
    newsCount, tournamentsCount, branchesCount, coachesCount,
    enrollmentsCount, newEnrollments, commentsCount, tournamentRegistrationsCount, pendingTournamentRegistrations,
  ] = await Promise.all([
    News.countDocuments(),
    Tournament.countDocuments(),
    Branch.countDocuments(),
    Coach.countDocuments(),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'new' }),
    TournamentComment.countDocuments({ isDeleted: { $ne: true } }),
    TournamentRegistration.countDocuments(),
    TournamentRegistration.countDocuments({ status: 'pending' }),
  ]);

  const recentEnrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('branch', 'name')
    .lean();

  const stats = [
    { label: 'Новости', value: newsCount, icon: Newspaper, href: '/admin/news', color: 'bg-blue-500' },
    { label: 'Турниры', value: tournamentsCount, icon: Trophy, href: '/admin/tournaments', color: 'bg-purple-500' },
    { label: 'Филиалы', value: branchesCount, icon: MapPin, href: '/admin/branches', color: 'bg-green-500' },
    { label: 'Тренеры', value: coachesCount, icon: Users, href: '/admin/coaches', color: 'bg-orange-500' },
    { label: 'Заявки', value: enrollmentsCount, icon: ClipboardList, href: '/admin/enrollments', color: 'bg-red-500',
      badge: newEnrollments > 0 ? newEnrollments : undefined },
    { label: 'Турнирные заявки', value: tournamentRegistrationsCount, icon: ClipboardCheck, href: '/admin/tournament-registrations', color: 'bg-indigo-500',
      badge: pendingTournamentRegistrations > 0 ? pendingTournamentRegistrations : undefined },
    { label: 'Комментарии', value: commentsCount, icon: MessageSquare, href: '/admin/comments', color: 'bg-pink-500' },
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    new: 'Новая', processing: 'В обработке', confirmed: 'Подтверждена', cancelled: 'Отменена',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-king-navy">Панель управления</h1>
        <p className="text-king-gray mt-1">Обзор ChessKing</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href, color, badge }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {badge !== undefined && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge} новых
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-bold text-king-navy mt-3">{value}</p>
            <p className="text-king-gray text-sm mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent enrollments */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-king-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-king-gold" />
            Последние заявки
          </h2>
          <Link href="/admin/enrollments" className="text-king-blue text-sm hover:underline">
            Все заявки →
          </Link>
        </div>

        {recentEnrollments.length === 0 ? (
          <p className="text-king-gray text-sm text-center py-8">Заявок пока нет</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-king-gray font-medium">Имя</th>
                  <th className="text-left pb-3 text-king-gray font-medium hidden sm:table-cell">Телефон</th>
                  <th className="text-left pb-3 text-king-gray font-medium hidden md:table-cell">Филиал</th>
                  <th className="text-left pb-3 text-king-gray font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentEnrollments.map((e: any) => (
                  <tr key={e._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-king-navy">{e.parentName}</td>
                    <td className="py-3 text-king-gray hidden sm:table-cell">{e.phone}</td>
                    <td className="py-3 text-king-gray hidden md:table-cell">{e.branch?.name || '—'}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[e.status]}`}>
                        {statusLabels[e.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
