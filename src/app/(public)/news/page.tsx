import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import News from '@/models/News';
import { escapeRegExp, formatDateShort } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ChevronRight, Crown, Search, Sparkles } from 'lucide-react';
import Reveal from '@/components/shared/Reveal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Новости',
  description: 'Последние новости шахматной академии ChessKing',
};

const PER_PAGE = 9;

interface Props {
  searchParams: { page?: string; q?: string };
}

export default async function NewsPage({ searchParams }: Props) {
  await connectDB();

  const requestedPage = Math.max(1, Number.parseInt(searchParams.page || '1', 10) || 1);
  const q = (searchParams.q || '').trim().slice(0, 100);

  const filter: Record<string, unknown> = { isPublished: true };
  if (q) filter.title = { $regex: escapeRegExp(q), $options: 'i' };

  const total = await News.countDocuments(filter);
  const totalPages = Math.ceil(total / PER_PAGE);
  const page = Math.min(requestedPage, totalPages || 1);
  const skip = (page - 1) * PER_PAGE;
  const news = await News.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(PER_PAGE).lean();

  const hrefForPage = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (pageNumber > 1) params.set('page', String(pageNumber));
    if (q) params.set('q', q);
    const query = params.toString();
    return query ? `/news?${query}` : '/news';
  };

  const paginationPages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#071020] py-16 sm:py-20">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 chess-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              Академия ChessKing
            </div>
            <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">Новости</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Следите за турнирами, достижениями учеников и важными событиями академии.
            </p>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Reveal className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:p-5">
          <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="relative block">
              <span className="sr-only">Поиск новостей</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                type="text"
                placeholder="Поиск новостей..."
                className="input h-12 pl-12"
              />
            </label>
            <button type="submit" className="btn-primary h-12 px-6">
              Найти
            </button>
          </form>
          <div className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{total > 0 ? `Найдено: ${total}` : 'Пока нет опубликованных новостей'}</span>
            {q && (
              <Link href="/news" className="inline-flex items-center font-semibold text-[#1D4ED8] hover:text-[#0B1F3A]">
                Очистить поиск
              </Link>
            )}
          </div>
        </Reveal>

        {news.length === 0 && (
          <Reveal className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-lg shadow-slate-900/5">
            <Crown className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="font-display text-2xl font-bold text-[#0B1F3A]">Новостей не найдено</p>
            {q && (
              <Link href="/news" className="btn-outline mt-6 inline-flex">
                Показать все новости
              </Link>
            )}
          </Reveal>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item: any, index) => (
            <Reveal key={item._id.toString()} delay={index * 0.04}>
              <Link href={`/news/${item.slug}`} className="card group block h-full">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0B1F3A] chess-bg">
                      <Crown className="h-16 w-16 text-[#F59E0B]" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#0B1F3A] shadow-lg">
                    Новость
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.publishedAt ? formatDateShort(item.publishedAt) : formatDateShort(item.createdAt)}
                  </p>
                  <h2 className="mt-3 font-display text-xl font-bold leading-snug text-[#0B1F3A] transition-colors group-hover:text-[#1D4ED8] line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">{item.excerpt}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1D4ED8]">
                    Читать
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация новостей">
            {page > 1 && (
              <Link
                href={hrefForPage(page - 1)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:shadow-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Link>
            )}

            {paginationPages.map((p, index) => (
              <div key={p} className="flex items-center gap-2">
                {index > 0 && p - paginationPages[index - 1] > 1 && (
                  <span className="w-8 text-center text-sm font-bold text-slate-400">...</span>
                )}
                <Link
                  href={hrefForPage(p)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    p === page
                      ? 'bg-[#0B1F3A] text-white shadow-lg shadow-slate-900/20'
                      : 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:shadow-lg'
                  }`}
                >
                  {p}
                </Link>
              </div>
            ))}

            {page < totalPages && (
              <Link
                href={hrefForPage(page + 1)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1D4ED8] hover:text-[#1D4ED8] hover:shadow-lg"
              >
                Вперёд
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
