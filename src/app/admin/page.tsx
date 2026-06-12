import connectDB from '@/lib/db';
import News from '@/models/News';
import Tournament from '@/models/Tournament';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import { Enrollment, TournamentComment, TournamentRegistration } from '@/models/index';
import { Newspaper, Trophy, MapPin, Users, ClipboardList, MessageSquare, TrendingUp, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';
import T from '@/components/i18n/T';
import DynamicText from '@/components/i18n/DynamicText';

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
    { labelKey: 'admin.news', value: newsCount, icon: Newspaper, href: '/admin/news', color: 'bg-blue-500' },
    { labelKey: 'admin.tournaments', value: tournamentsCount, icon: Trophy, href: '/admin/tournaments', color: 'bg-purple-500' },
    { labelKey: 'admin.branches', value: branchesCount, icon: MapPin, href: '/admin/branches', color: 'bg-green-500' },
    { labelKey: 'admin.coaches', value: coachesCount, icon: Users, href: '/admin/coaches', color: 'bg-orange-500' },
    { labelKey: 'admin.enrollments', value: enrollmentsCount, icon: ClipboardList, href: '/admin/enrollments', color: 'bg-red-500',
      badge: newEnrollments > 0 ? newEnrollments : undefined },
    { labelKey: 'admin.tournamentApplications', value: tournamentRegistrationsCount, icon: ClipboardCheck, href: '/admin/tournament-registrations', color: 'bg-indigo-500',
      badge: pendingTournamentRegistrations > 0 ? pendingTournamentRegistrations : undefined },
    { labelKey: 'admin.comments', value: commentsCount, icon: MessageSquare, href: '/admin/comments', color: 'bg-pink-500' },
  ];

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const statusLabels: Record<string, string> = {
    new: 'admin.statusNew', processing: 'admin.statusProcessing', confirmed: 'admin.statusConfirmed', cancelled: 'admin.statusCancelled',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-king-navy"><T k="admin.dashboardTitle" /></h1>
        <p className="text-king-gray mt-1"><T k="admin.dashboardSubtitle" /></p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(({ labelKey, value, icon: Icon, href, color, badge }) => (
          <Link
            key={labelKey}
            href={href}
            className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              {badge !== undefined && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  <T k="common.newCount" values={{ count: badge }} />
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-bold text-king-navy mt-3">{value}</p>
            <p className="text-king-gray text-sm mt-0.5"><T k={labelKey} /></p>
          </Link>
        ))}
      </div>

      {/* Recent enrollments */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-bold text-king-navy flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-king-gold" />
            <T k="admin.recentEnrollments" />
          </h2>
          <Link href="/admin/enrollments" className="text-king-blue text-sm hover:underline">
            <T k="admin.allEnrollments" />
          </Link>
        </div>

        {recentEnrollments.length === 0 ? (
          <p className="text-king-gray text-sm text-center py-8"><T k="admin.noEnrollments" /></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-king-gray font-medium"><T k="admin.tableName" /></th>
                  <th className="text-left pb-3 text-king-gray font-medium hidden sm:table-cell"><T k="admin.tablePhone" /></th>
                  <th className="text-left pb-3 text-king-gray font-medium hidden md:table-cell"><T k="admin.tableBranch" /></th>
                  <th className="text-left pb-3 text-king-gray font-medium"><T k="admin.tableStatus" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentEnrollments.map((e: any) => (
                  <tr key={e._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-king-navy">{e.parentName}</td>
                    <td className="py-3 text-king-gray hidden sm:table-cell">{e.phone}</td>
                    <td className="py-3 text-king-gray hidden md:table-cell">
                      {e.branch?.name ? <DynamicText text={e.branch.name} cacheKey={`branch-name-${e.branch._id || e.branch.name}`} /> : '—'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[e.status]}`}>
                        <T k={statusLabels[e.status]} />
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
