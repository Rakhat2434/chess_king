import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import News from '@/models/News';
import Tournament from '@/models/Tournament';
import { getWhatsAppUrl, INSTAGRAM_URL } from '@/lib/utils';
import { translate } from '@/lib/i18n';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Crown,
  Instagram,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import ShareButton from '@/components/shared/ShareButton';
import Reveal from '@/components/shared/Reveal';
import T from '@/components/i18n/T';
import DynamicText from '@/components/i18n/DynamicText';
import LocalizedDate from '@/components/i18n/LocalizedDate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: translate('ru', 'home.metaTitle'),
  description: translate('ru', 'home.metaDescription'),
};

async function getHomeData() {
  await connectDB();
  const [latestNews, upcomingTournaments] = await Promise.all([
    News.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(6).lean(),
    Tournament.find({ isPublished: true, status: { $in: ['upcoming', 'ongoing'] } })
      .sort({ startDate: 1 })
      .limit(3)
      .populate('branch', 'name city')
      .lean(),
  ]);

  return { latestNews, upcomingTournaments };
}

const heroStats = [
  { icon: Users, value: '500+', labelKey: 'home.statsStudents' },
  { icon: Trophy, value: '120+', labelKey: 'home.statsTournaments' },
  { icon: ShieldCheck, value: '15+', labelKey: 'home.statsCoaches' },
  { icon: MapPin, value: '3', labelKey: 'home.statsBranches' },
];

const features = [
  {
    icon: ShieldCheck,
    titleKey: 'home.featureCoachTitle',
    descKey: 'home.featureCoachText',
  },
  {
    icon: Target,
    titleKey: 'home.featureGrowthTitle',
    descKey: 'home.featureGrowthText',
  },
  {
    icon: Trophy,
    titleKey: 'home.featureTournamentsTitle',
    descKey: 'home.featureTournamentsText',
  },
  {
    icon: Zap,
    titleKey: 'home.featureLiveTitle',
    descKey: 'home.featureLiveText',
  },
];

const boardSquares = Array.from({ length: 64 }, (_, index) => {
  const row = Math.floor(index / 8);
  const column = index % 8;
  return (row + column) % 2 === 0;
});

export default async function HomePage() {
  const { latestNews, upcomingTournaments } = await getHomeData();

  return (
    <>
      <section className="relative overflow-hidden bg-[#071020]">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 chess-bg opacity-30" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-400/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#071020] to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
          <Reveal className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 shadow-lg shadow-black/10 backdrop-blur">
              <Crown className="h-4 w-4 text-[#F59E0B]" />
              <T k="home.badge" />
            </div>

            <h1 className="hero-title font-display text-5xl text-white sm:text-6xl lg:text-7xl">
              <T k="home.heroTitleStart" />{' '}
              <span className="bg-gradient-to-r from-[#F59E0B] via-amber-200 to-[#F59E0B] bg-clip-text text-transparent">
                <T k="home.heroTitleHighlight" />
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
              <T k="home.heroText" />
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/enroll" className="btn-gold px-8 py-4 text-base sm:w-auto">
                <Crown className="h-5 w-5" />
                <T k="home.enrollButton" />
              </Link>
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white hover:text-[#0B1F3A] hover:shadow-xl active:scale-95 sm:w-auto"
              >
                <T k="home.viewTournaments" />
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-medium text-slate-300">
              <a
                href={getWhatsAppUrl(translate('ru', 'whatsappMessages.home'))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-green-300"
              >
                <MessageCircle className="h-5 w-5 text-green-300" />
                WhatsApp
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-pink-300"
              >
                <Instagram className="h-5 w-5 text-pink-300" />
                Instagram
              </a>
              <ShareButton url="/" className="inline-flex items-center gap-2 text-slate-300 transition-colors hover:text-[#F59E0B]" />
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-400/20 via-blue-500/10 to-white/5 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_0.82fr]">
                <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#0B1F3A] p-3 shadow-xl shadow-black/20">
                  <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-xl">
                    {boardSquares.map((isLight, index) => (
                      <div
                        key={index}
                        className={isLight ? 'bg-amber-100' : 'bg-[#15365E]'}
                      />
                    ))}
                  </div>
                  <div className="pointer-events-none absolute left-[22%] top-[22%] flex h-24 w-24 items-center justify-center rounded-full border border-amber-300/50 bg-[#071020]/90 text-6xl text-[#F59E0B] shadow-2xl shadow-amber-500/20 sm:h-28 sm:w-28">
                    ♞
                  </div>
                </div>

                <div className="grid gap-3">
                  {heroStats.map(({ icon: Icon, value, labelKey }) => (
                    <div
                      key={labelKey}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-lg shadow-black/10"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B] shadow-lg shadow-amber-500/20">
                        <Icon className="h-5 w-5 text-[#0B1F3A]" />
                      </div>
                      <div>
                        <div className="font-display text-3xl font-bold leading-none text-white">{value}</div>
                        <div className="mt-1 text-sm font-medium text-slate-300"><T k={labelKey} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <div>
                    <p className="font-semibold text-white"><T k="home.trialTitle" /></p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      <T k="home.trialText" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F59E0B]"><T k="home.approachEyebrow" /></p>
            <h2 className="section-title mt-3"><T k="home.approachTitle" /></h2>
            <p className="section-subtitle">
              <T k="home.approachText" />
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, titleKey, descKey }, index) => (
              <Reveal key={titleKey} delay={index * 0.04}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl hover:shadow-slate-900/10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0B1F3A] transition-all duration-300 group-hover:bg-[#F59E0B] group-hover:shadow-lg group-hover:shadow-amber-500/25">
                    <Icon className="h-6 w-6 text-white transition-colors duration-300 group-hover:text-[#0B1F3A]" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0B1F3A]"><T k={titleKey} /></h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600"><T k={descKey} /></p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F59E0B]"><T k="home.newsEyebrow" /></p>
                <h2 className="section-title mt-3"><T k="home.newsTitle" /></h2>
              </div>
              <Link href="/news" className="btn-outline w-full px-5 py-3 text-sm sm:w-auto">
                <T k="home.allNews" />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((news: any, index) => (
                <Reveal key={news._id.toString()} delay={index * 0.04}>
                  <Link href={`/news/${news.slug}`} className="card group block h-full">
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      {news.coverImage ? (
                        <Image
                          src={news.coverImage}
                          alt={news.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0B1F3A]">
                          <Crown className="h-16 w-16 text-[#F59E0B]" />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A] shadow-lg">
                        <T k="home.newsBadge" />
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <LocalizedDate value={news.publishedAt || news.createdAt} format="short" />
                      </p>
                      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-[#0B1F3A] transition-colors group-hover:text-[#1D4ED8] line-clamp-2">
                        <DynamicText text={news.title} cacheKey={`news-title-${news._id}`} />
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
                        <DynamicText text={news.excerpt} cacheKey={`news-excerpt-${news._id}`} />
                      </p>
                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1D4ED8]">
                        <T k="common.read" />
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {upcomingTournaments.length > 0 && (
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F59E0B]"><T k="home.tournamentsEyebrow" /></p>
                <h2 className="section-title mt-3"><T k="home.tournamentsTitle" /></h2>
              </div>
              <Link href="/tournaments" className="btn-outline w-full px-5 py-3 text-sm sm:w-auto">
                <T k="home.allTournaments" />
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map((tournament: any, index) => (
                <Reveal key={tournament._id.toString()} delay={index * 0.05}>
                  <Link href={`/tournaments/${tournament.slug}`} className="card group block h-full">
                    <div className="relative h-48 overflow-hidden bg-[#0B1F3A] chess-bg">
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
                        <span className={tournament.status === 'ongoing' ? 'badge-ongoing' : 'badge-upcoming'}>
                          <T k={tournament.status === 'ongoing' ? 'tournaments.statusOngoingShort' : 'tournaments.statusUpcomingShort'} />
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-bold leading-snug text-[#0B1F3A] transition-colors group-hover:text-[#1D4ED8] line-clamp-2">
                        <DynamicText text={tournament.title} cacheKey={`tournament-title-${tournament._id}`} />
                      </h3>
                      <div className="mt-4 grid gap-2 text-sm font-medium text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#F59E0B]" />
                          <LocalizedDate value={tournament.startDate} format="short" />
                        </span>
                        {tournament.branch && (
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#F59E0B]" />
                            <DynamicText text={tournament.branch.name} cacheKey={`branch-name-${tournament.branch._id || tournament.branch.name}`} />
                          </span>
                        )}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-2">
                        <DynamicText text={tournament.description} cacheKey={`tournament-description-${tournament._id}`} />
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-[#071020] py-20 sm:py-24">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 chess-bg opacity-30" />
        <Reveal className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F59E0B]"><T k="home.startEyebrow" /></p>
          <h2 className="hero-title mt-3 font-display text-4xl text-white sm:text-5xl">
            <T k="home.startTitle" />
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            <T k="home.startText" />
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/enroll" className="btn-gold px-9 py-4 text-base">
              <Crown className="h-5 w-5" />
              <T k="home.freeEnroll" />
            </Link>
            <a
              href={getWhatsAppUrl(translate('ru', 'whatsappMessages.trial'))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#0B1F3A]"
            >
              <MessageCircle className="h-5 w-5 text-green-300" />
              WhatsApp
            </a>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm font-medium text-slate-300 sm:flex-row sm:gap-6">
            {['home.noPrepayment', 'home.freeTrial', 'home.levelGroups'].map((itemKey) => (
              <span key={itemKey} className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#F59E0B]" />
                <T k={itemKey} />
              </span>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
