'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate, formatDateShort } from '@/lib/utils';
import { BookOpen, MessageSquare, History, MapPin, Calendar, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'enrollments', label: 'Мои записи', icon: BookOpen },
  { id: 'comments', label: 'Комментарии', icon: MessageSquare },
  { id: 'visits', label: 'История', icon: History },
];

interface Props {
  enrollments: any[];
  comments: any[];
  visits: any[];
  statusLabel: Record<string, { label: string; color: string }>;
}

export default function DashboardTabs({ enrollments, comments, visits, statusLabel }: Props) {
  const [active, setActive] = useState('enrollments');

  const levelLabel: Record<string, string> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  };

  return (
    <div>
      {/* Tab nav */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-card mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
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
            {label}
            {id === 'enrollments' && enrollments.length > 0 && (
              <span className={cn('text-xs px-2 py-0.5 rounded-full', active === id ? 'bg-white/20' : 'bg-gray-100')}>
                {enrollments.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Enrollments */}
      {active === 'enrollments' && (
        <div>
          {enrollments.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-10 h-10 text-gray-200" />}
              title="Записей пока нет"
              desc="Запишитесь на занятия в ChessKing"
              cta={{ href: '/enroll', label: 'Записаться' }}
            />
          ) : (
            <div className="space-y-4">
              {enrollments.map((e) => (
                <div key={e._id} className="bg-white rounded-2xl shadow-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display font-semibold text-king-navy text-base">{e.parentName}</h3>
                      {e.studentName && <p className="text-sm text-king-gray">Ученик: {e.studentName}</p>}
                    </div>
                    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusLabel[e.status]?.color)}>
                      {statusLabel[e.status]?.label || e.status}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm text-king-gray">
                    {e.branch && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-king-gold" />
                        {e.branch.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-king-gold" />
                      {e.preferredTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-king-gold" />
                      {formatDateShort(e.createdAt)}
                    </span>
                  </div>
                  {e.level && (
                    <p className="text-xs text-king-gray mt-2">
                      Уровень: <span className="font-medium text-king-navy">{levelLabel[e.level]}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {active === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="w-10 h-10 text-gray-200" />}
              title="Комментариев пока нет"
              desc="Оставьте комментарий под турниром"
              cta={{ href: '/tournaments', label: 'Турниры' }}
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
                          {c.tournament.title}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                    <span className="text-xs text-king-gray flex-shrink-0">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-king-navy text-sm leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Visit History */}
      {active === 'visits' && (
        <div>
          {visits.length === 0 ? (
            <EmptyState
              icon={<History className="w-10 h-10 text-gray-200" />}
              title="История пуста"
              desc="Просматривайте турниры, и они появятся здесь"
              cta={{ href: '/tournaments', label: 'Смотреть турниры' }}
            />
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v._id} className="bg-white rounded-xl shadow-card p-5 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    {v.tournament ? (
                      <Link
                        href={`/tournaments/${v.tournament.slug}`}
                        className="font-medium text-king-navy hover:text-king-blue transition-colors flex items-center gap-1.5"
                      >
                        {v.tournament.title}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-king-gray">Турнир удалён</span>
                    )}
                    <p className="text-xs text-king-gray mt-1">{formatDate(v.visitedAt)}</p>
                  </div>
                  {v.tournament && (
                    <span className={
                      v.tournament.status === 'ongoing' ? 'badge-ongoing' :
                      v.tournament.status === 'upcoming' ? 'badge-upcoming' :
                      'badge-completed text-xs'
                    }>
                      {v.tournament.status === 'ongoing' ? 'Идёт' :
                       v.tournament.status === 'upcoming' ? 'Скоро' : 'Завершён'}
                    </span>
                  )}
                </div>
              ))}
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
