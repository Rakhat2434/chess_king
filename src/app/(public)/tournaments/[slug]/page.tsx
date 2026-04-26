import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Tournament from '@/models/Tournament';
import { TournamentComment, TournamentRegistration, TournamentVisit } from '@/models/index';
import { formatDate } from '@/lib/utils';
import { Trophy, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import ShareButton from '@/components/shared/ShareButton';
import TournamentComments from '@/components/tournament/TournamentComments';
import TournamentGallery from '@/components/tournament/TournamentGallery';
import TournamentRegistrationActions from '@/components/tournament/TournamentRegistrationActions';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const t = await Tournament.findOne({ slug: params.slug, isPublished: true }).lean() as any;
  if (!t) return { title: 'Турнир не найден' };
  return {
    title: t.title,
    description: t.description?.slice(0, 160),
    openGraph: {
      title: t.title,
      images: t.coverImage ? [{ url: t.coverImage }] : [],
    },
  };
}

export default async function TournamentDetailPage({ params }: Props) {
  await connectDB();

  const tournament = await Tournament.findOne({ slug: params.slug, isPublished: true })
    .populate('branch', 'name city address phone')
    .lean() as any;

  if (!tournament) notFound();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Track visit
  if (userId) {
    try {
      await TournamentVisit.updateOne(
        { user: userId, tournament: tournament._id },
        { $set: { visitedAt: new Date() } },
        { upsert: true }
      );
    } catch {}
  }

  const currentRegistration = userId
    ? await TournamentRegistration.findOne({ user: userId, tournament: tournament._id }).lean() as any
    : null;

  const comments = await TournamentComment.find({
    tournament: tournament._id,
    isVisible: true,
    isDeleted: { $ne: true },
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const placeEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const statusLabel: Record<string, string> = {
    upcoming: 'Предстоит',
    ongoing: 'Идёт',
    completed: 'Завершён',
  };
  const tournamentDateLabel = tournament.endDate
    ? `${formatDate(tournament.startDate)} — ${formatDate(tournament.endDate)}`
    : formatDate(tournament.startDate);
  const branchLabel = tournament.branch
    ? `${tournament.branch.name}${tournament.branch.city ? `, ${tournament.branch.city}` : ''}`
    : 'Не указан';

  return (
    <div className="min-h-screen bg-white">
      {/* Cover */}
      <div className="relative h-[50vh] bg-royal-gradient chess-bg overflow-hidden">
        {tournament.coverImage && (
          <Image src={tournament.coverImage} alt={tournament.title} fill className="object-cover opacity-70" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-king-navy/90 via-king-navy/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/tournaments" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Все турниры
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={
                tournament.status === 'ongoing' ? 'badge-ongoing' :
                tournament.status === 'upcoming' ? 'badge-upcoming' :
                'badge-completed'
              }>
                {statusLabel[tournament.status]}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
              {tournament.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Meta */}
        <div className="flex flex-wrap gap-4 mb-8 text-sm text-king-gray p-5 bg-gray-50 rounded-2xl">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-king-gold" />
            {formatDate(tournament.startDate)}
            {tournament.endDate && ` — ${formatDate(tournament.endDate)}`}
          </span>
          {tournament.branch && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-king-gold" />
              {tournament.branch.name}{tournament.branch.city ? `, ${tournament.branch.city}` : ''}
            </span>
          )}
          <ShareButton url={`/tournaments/${params.slug}`} className="flex items-center gap-1.5 text-king-blue hover:underline ml-auto" />
        </div>

        <TournamentRegistrationActions
          tournamentId={tournament._id.toString()}
          title={tournament.title}
          dateLabel={tournamentDateLabel}
          branchLabel={branchLabel}
          isAuthenticated={Boolean(userId)}
          isClosed={tournament.status === 'completed'}
          initialStatus={currentRegistration?.status || null}
        />

        {/* Description */}
        <div className="prose-king font-sans mb-10">
          <p>{tournament.description}</p>
        </div>

        {/* Prizes for completed */}
        {tournament.status === 'completed' && tournament.prizes?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-king-navy mb-5 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-king-gold" />
              Результаты турнира
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tournament.prizes.map((prize: any) => (
                <div
                  key={prize.place}
                  className={`text-center p-6 rounded-2xl border-2 ${
                    prize.place === 1
                      ? 'border-king-gold bg-gold-50'
                      : prize.place === 2
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-orange-300 bg-orange-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{placeEmoji[prize.place]}</div>
                  {prize.photo && (
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white shadow-md">
                      <Image src={prize.photo} alt={prize.name} width={64} height={64} className="object-cover" />
                    </div>
                  )}
                  <p className="font-display font-bold text-king-navy text-lg">{prize.name}</p>
                  <p className="text-sm text-king-gray mt-1">{prize.place} место</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {tournament.gallery?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-king-navy mb-5">Фотогалерея</h2>
            <TournamentGallery images={tournament.gallery} title={tournament.title} />
          </div>
        )}

        {/* Comments */}
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-king-navy mb-6 flex items-center gap-2">
            Комментарии
            <span className="text-sm font-sans font-normal text-king-gray">({comments.length})</span>
          </h2>
          <TournamentComments
            tournamentId={tournament._id.toString()}
            initialComments={JSON.parse(JSON.stringify(comments))}
            session={userId ? { id: userId, name: session?.user?.name || '', role: session?.user?.role || 'user' } : null}
          />
        </div>
      </div>
    </div>
  );
}
