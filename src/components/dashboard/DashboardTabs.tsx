'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Clock, ExternalLink, MapPin, MessageSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LocalizedDate from '@/components/i18n/LocalizedDate';
import DynamicText from '@/components/i18n/DynamicText';

const tabs = [
  { id: 'enrollments', labelKey: 'dashboard.tabEnrollments', icon: BookOpen },
  { id: 'comments', labelKey: 'dashboard.tabComments', icon: MessageSquare },
  { id: 'tournaments', labelKey: 'dashboard.tabTournaments', icon: Trophy },
];

interface Props {
  enrollments: any[];
  comments: any[];
  tournamentRegistrations: any[];
}

export default function DashboardTabs({
  enrollments,
  comments,
  tournamentRegistrations,
}: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState('enrollments');

  const statusLabel: Record<string, { labelKey: string; color: string }> = {
    new: { labelKey: 'dashboard.statusNew', color: 'bg-blue-100 text-blue-700' },
    processing: { labelKey: 'dashboard.statusProcessing', color: 'bg-yellow-100 text-yellow-700' },
    confirmed: { labelKey: 'dashboard.statusConfirmed', color: 'bg-green-100 text-green-700' },
    cancelled: { labelKey: 'dashboard.statusCancelled', color: 'bg-red-100 text-red-700' },
  };

  const tournamentStatusLabel: Record<string, { labelKey: string; color: string }> = {
    pending: { labelKey: 'dashboard.tournamentPending', color: 'bg-yellow-100 text-yellow-700' },
    approved: { labelKey: 'dashboard.tournamentApproved', color: 'bg-green-100 text-green-700' },
    rejected: { labelKey: 'dashboard.tournamentRejected', color: 'bg-red-100 text-red-700' },
    attended: { labelKey: 'dashboard.tournamentAttended', color: 'bg-blue-100 text-blue-700' },
    cancelled: { labelKey: 'dashboard.tournamentCancelled', color: 'bg-gray-100 text-gray-600' },
  };

  const levelLabel: Record<string, string> = {
    beginner: t('dashboard.levelBeginner'),
    intermediate: t('dashboard.levelIntermediate'),
    advanced: t('dashboard.levelAdvanced'),
  };

  return (
    <div>
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-card mb-8 overflow-x-auto">
        {tabs.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center',
              active === id
                ? 'bg-king-blue text-white shadow-royal'
                : 'text-king-gray hover:text-king-navy hover:bg-gray-50'
            )}
          >
            <Icon className="w-4 h-4" />
            {t(labelKey)}
            {id === 'enrollments' && enrollments.length > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full', active === id ? 'bg-white/20' : 'bg-gray-100')}>
                {enrollments.length}
              </span>
            )}
            {id === 'tournaments' && tournamentRegistrations.length > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full', active === id ? 'bg-white/20' : 'bg-gray-100')}>
                {tournamentRegistrations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {active === 'enrollments' && (
        <div>
          {enrollments.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-10 h-10 text-gray-200" />}
              title={t('dashboard.emptyEnrollments')}
              desc={t('dashboard.emptyEnrollmentsText')}
              cta={{ href: '/enroll', label: t('nav.enroll') }}
            />
          ) : (
            <div className="space-y-4">
              {enrollments.map((e) => (
                <div key={e._id} className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-king-navy text-base">{e.parentName}</h3>
                      {e.studentName && <p className="text-sm text-king-gray">{t('dashboard.student', { name: e.studentName })}</p>}
                    </div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusLabel[e.status]?.color)}>
                      {statusLabel[e.status]?.labelKey ? t(statusLabel[e.status].labelKey) : e.status}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm text-king-gray">
                    {e.branch && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-king-gold" />
                        <DynamicText text={e.branch.name} cacheKey={`branch-name-${e.branch._id || e.branch.name}`} />
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-king-gold" />
                      {e.preferredTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-king-gold" />
                      <LocalizedDate value={e.createdAt} format="short" />
                    </span>
                  </div>
                  {e.level && (
                    <p className="text-xs text-king-gray mt-2">
                      {t('dashboard.level')} <span className="font-medium text-king-navy">{levelLabel[e.level]}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-10 h-10 text-gray-200" />}
              title={t('dashboard.emptyComments')}
              desc={t('dashboard.emptyCommentsText')}
              cta={{ href: '/tournaments', label: t('nav.tournaments') }}
            />
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      {c.tournament && (
                        <Link
                          href={`/tournaments/${c.tournament.slug}`}
                          className="text-king-blue font-medium text-sm hover:underline flex items-center gap-1"
                        >
                          <DynamicText text={c.tournament.title} cacheKey={`tournament-title-${c.tournament._id || c.tournament.slug}`} />
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-king-gray flex-shrink-0"><LocalizedDate value={c.createdAt} /></span>
                  </div>
                  <p className="text-king-navy text-sm leading-relaxed">
                    <DynamicText text={c.content || c.text} cacheKey={`comment-${c._id}`} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'tournaments' && (
        <div>
          {tournamentRegistrations.length === 0 ? (
            <EmptyState
              icon={<Trophy className="w-10 h-10 text-gray-200" />}
              title={t('dashboard.emptyTournaments')}
              desc={t('dashboard.emptyTournamentsText')}
              cta={{ href: '/tournaments', label: t('dashboard.watchTournaments') }}
            />
          ) : (
            <div className="space-y-4">
              {tournamentRegistrations.map((registration) => {
                const tournament = registration.tournament;
                const status = tournamentStatusLabel[registration.status] || {
                  labelKey: registration.status,
                  color: 'bg-gray-100 text-gray-600',
                };

                return (
                  <div key={registration._id} className="bg-white rounded-2xl shadow-card p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        {tournament ? (
                          <Link
                            href={`/tournaments/${tournament.slug}`}
                            className="font-display font-semibold text-king-navy hover:text-king-blue transition-colors inline-flex items-center gap-1.5"
                          >
                            <DynamicText text={tournament.title} cacheKey={`tournament-title-${tournament._id || tournament.slug}`} />
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="font-display font-semibold text-king-gray">{t('dashboard.deletedTournament')}</span>
                        )}
                        <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm text-king-gray">
                          {tournament?.startDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-king-gold" />
                              <LocalizedDate value={tournament.startDate} format="short" />
                            </span>
                          )}
                          {tournament?.branch && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-king-gold" />
                              <DynamicText
                                text={`${tournament.branch.name}${tournament.branch.city ? `, ${tournament.branch.city}` : ''}`}
                                cacheKey={`branch-title-${tournament.branch._id || tournament.branch.name}`}
                              />
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-king-gold" />
                            {t('dashboard.applicationDate')} <LocalizedDate value={registration.createdAt} format="short" />
                          </span>
                        </div>
                        {registration.adminNote && (
                          <p className="text-xs text-king-gray mt-3 italic">&quot;{registration.adminNote}&quot;</p>
                        )}
                      </div>
                      <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', status.color)}>
                        {t(status.labelKey)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-card">
      <div className="flex justify-center mb-4">{icon}</div>
      <p className="font-display text-xl text-gray-400 mb-2">{title}</p>
      <p className="text-king-gray text-sm mb-5">{desc}</p>
      <Link href={cta.href} className="btn-primary text-sm py-2.5 px-5 inline-flex">
        {cta.label}
      </Link>
    </div>
  );
}
