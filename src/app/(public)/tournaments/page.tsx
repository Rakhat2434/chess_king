import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import Branch from '@/models/Branch';
import { formatDateShort } from '@/lib/utils';
import { Calendar, Filter, MapPin, Sparkles, Trophy } from 'lucide-react';
import Reveal from '@/components/shared/Reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Турниры',
  description: 'Шахматные турниры ChessKing — предстоящие, текущие и завершённые',
};

interface Props {
  searchParams: { status?: string; branch?: string };
}

const statusLabels: Record<string, string> = {
  all: 'Все',
  upcoming: 'Предстоящие',
  ongoing: 'Идут сейчас',
  completed: 'Завершённые',
};

export default async function TournamentsPage({ searchParams }: Props) {
  await connectDB();

  const statusFilter = searchParams.status || 'all';
  const branchFilter = searchParams.branch || '';

  const filter: any = { isPublished: true };
  if (statusFilter !== 'all') filter.status = statusFilter;
  if (branchFilter) filter.branch = branchFilter;

  const [tournaments, branches] = await Promise.all([
    Tournament.find(filter).sort({ startDate: -1 }).populate('branch', 'name city').lean(),
    Branch.find({ isActive: true }).lean(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#071020] py-16 sm:py-20">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 chess-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              Соревновательная практика
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">Турниры</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Участвуйте в турнирах академии, набирайте опыт и отслеживайте ближайшие события.
            </p>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Reveal className="mb-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
            <Filter className="h-4 w-4 text-[#F59E0B]" />
            Фильтры
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(statusLabels).map(([key, label]) => (
              <Link
                key={key}
                href={`/tournaments?status=${key}${branchFilter ? `&branch=${branchFilter}` : ''}`}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  statusFilter === key
                    ? 'bg-[#0B1F3A] text-white shadow-lg shadow-slate-900/20'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-[#1D4ED8] hover:bg-white hover:text-[#1D4ED8] hover:shadow-md'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {branches.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              <Link
                href={`/tournaments?status=${statusFilter}`}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  !branchFilter
                    ? 'bg-[#F59E0B] text-[#0B1F3A] shadow-lg shadow-amber-500/20'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-[#F59E0B] hover:bg-white hover:text-[#0B1F3A] hover:shadow-md'
                }`}
              >
                Все филиалы
              </Link>
              {branches.map((branch: any) => (
                <Link
                  key={branch._id.toString()}
                  href={`/tournaments?status=${statusFilter}&branch=${branch._id}`}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                    branchFilter === branch._id.toString()
                      ? 'bg-[#F59E0B] text-[#0B1F3A] shadow-lg shadow-amber-500/20'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:border-[#F59E0B] hover:bg-white hover:text-[#0B1F3A] hover:shadow-md'
                  }`}
                >
                  {branch.name}
                </Link>
              ))}
            </div>
          )}
        </Reveal>

        {tournaments.length === 0 && (
          <Reveal className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-lg shadow-slate-900/5">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="font-display text-2xl font-bold text-[#0B1F3A]">Турниров не найдено</p>
          </Reveal>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament: any, index) => (
            <Reveal key={tournament._id.toString()} delay={index * 0.04}>
              <Link href={`/tournaments/${tournament.slug}`} className="card group block h-full">
                <div className="relative h-56 overflow-hidden bg-[#0B1F3A] chess-bg">
                  {tournament.coverImage ? (
                    <Image
                      src={tournament.coverImage}
                      alt={tournament.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Trophy className="h-16 w-16 text-white/25" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <span
                      className={
                        tournament.status === 'ongoing'
                          ? 'badge-ongoing'
                          : tournament.status === 'upcoming'
                            ? 'badge-upcoming'
                            : 'badge-completed'
                      }
                    >
                      {tournament.status === 'ongoing'
                        ? 'Идёт'
                        : tournament.status === 'upcoming'
                          ? 'Скоро'
                          : 'Завершён'}
                    </span>
                  </div>
                  {tournament.status === 'completed' && tournament.prizes?.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-xl bg-[#071020]/90 p-3 shadow-lg backdrop-blur">
                        <p className="text-xs font-bold text-[#F59E0B]">1 место: {tournament.prizes[0]?.name}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl font-bold leading-snug text-[#0B1F3A] transition-colors group-hover:text-[#1D4ED8] line-clamp-2">
                    {tournament.title}
                  </h2>
                  <div className="mt-4 grid gap-2 text-sm font-medium text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#F59E0B]" />
                      {formatDateShort(tournament.startDate)}
                      {tournament.endDate && ` — ${formatDateShort(tournament.endDate)}`}
                    </span>
                    {tournament.branch && (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#F59E0B]" />
                        {tournament.branch.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}
