import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import News from '@/models/News';
import { Crown, ArrowLeft, Calendar, Eye } from 'lucide-react';
import ShareButton from '@/components/shared/ShareButton';
import { translate } from '@/lib/i18n';
import T from '@/components/i18n/T';
import DynamicText from '@/components/i18n/DynamicText';
import LocalizedDate from '@/components/i18n/LocalizedDate';

export const dynamic = 'force-dynamic';

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB();
  const news = await News.findOne({ slug: params.slug, isPublished: true }).lean() as any;
  if (!news) return { title: translate('ru', 'news.notFoundTitle') };
  return {
    title: news.title,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.coverImage ? [{ url: news.coverImage }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  await connectDB();

  const news = await News.findOneAndUpdate(
    { slug: params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('createdBy', 'name').lean() as any;

  if (!news) notFound();

  const related = await News.find({
    isPublished: true,
    _id: { $ne: news._id },
  }).sort({ publishedAt: -1 }).limit(3).lean() as any[];

  const pageUrl = `/news/${params.slug}`;

  return (
    <article className="min-h-screen bg-white">
      {/* Cover */}
      {news.coverImage && (
        <div className="relative h-[40vh] md:h-[55vh] bg-king-navy overflow-hidden">
          <Image src={news.coverImage} alt={news.title} fill className="object-cover opacity-80" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-king-navy/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/news" className="inline-flex items-center gap-2 text-king-blue text-sm font-medium mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <T k="news.allNews" />
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-5 text-sm text-king-gray">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-king-gold" />
            <LocalizedDate value={news.publishedAt || news.createdAt} />
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-king-gold" />
            <T k="common.views" values={{ count: news.views }} />
          </span>
          <ShareButton url={pageUrl} className="flex items-center gap-1.5 text-king-blue hover:underline cursor-pointer" />
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-king-navy leading-tight mb-8">
          <DynamicText text={news.title} cacheKey={`news-title-${news._id}`} />
        </h1>

        {!news.coverImage && (
          <div className="h-px bg-gradient-to-r from-transparent via-king-gold/30 to-transparent mb-8" />
        )}

        {/* Content */}
        <DynamicText
          as="div"
          className="prose-king font-sans whitespace-pre-line"
          text={news.content}
          cacheKey={`news-content-${news._id}`}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <p className="text-king-gray text-sm"><T k="news.shareArticle" /></p>
          <ShareButton url={pageUrl} showLabel />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-king-navy mb-8"><T k="news.related" /></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item: any) => (
                <Link key={item._id.toString()} href={`/news/${item.slug}`} className="card group cursor-pointer">
                  <div className="relative h-44 bg-gradient-to-br from-royal-100 to-royal-200 overflow-hidden">
                    {item.coverImage ? (
                      <Image src={item.coverImage} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Crown className="w-10 h-10 text-royal-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-king-gray mb-2"><LocalizedDate value={item.publishedAt || item.createdAt} /></p>
                    <h3 className="font-display font-semibold text-king-navy text-sm leading-snug group-hover:text-king-blue transition-colors line-clamp-2">
                      <DynamicText text={item.title} cacheKey={`news-title-${item._id}`} />
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
