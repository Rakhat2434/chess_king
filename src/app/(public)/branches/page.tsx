import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import { Clock, Map, MapPin, MessageCircle, Navigation, Phone, Sparkles, Users } from 'lucide-react';
import { getGoogleMapsEmbedSrc, getSafeGoogleMapsUrl, getWhatsAppUrl } from '@/lib/utils';
import Reveal from '@/components/shared/Reveal';
import { translate } from '@/lib/i18n';
import T from '@/components/i18n/T';
import DynamicText from '@/components/i18n/DynamicText';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: translate('ru', 'branches.metaTitle'),
  description: translate('ru', 'branches.metaDescription'),
};

export default async function BranchesPage() {
  await connectDB();
  const branches = await Branch.find({ isActive: true }).lean();

  const coachesByBranch: Record<string, any[]> = {};
  for (const branch of branches) {
    coachesByBranch[branch._id.toString()] = await Coach.find({
      branch: branch._id,
      isActive: true,
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-[#071020] py-16 sm:py-20">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute inset-0 chess-bg opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
              <T k="branches.badge" />
            </div>
            <h1 className="hero-title font-display text-5xl text-white sm:text-6xl"><T k="branches.title" /></h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              <T k="branches.subtitle" />
            </p>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {branches.length === 0 && (
          <Reveal className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-lg shadow-slate-900/5">
            <MapPin className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="font-display text-2xl font-bold text-[#0B1F3A]"><T k="branches.empty" /></p>
          </Reveal>
        )}

        {branches.map((branch: any, index) => {
          const coaches = coachesByBranch[branch._id.toString()] || [];
          const mapEmbedSrc = branch.mapEmbed
            ? getGoogleMapsEmbedSrc(branch.mapEmbed, [branch.address, branch.city])
            : null;
          const mapUrl = getSafeGoogleMapsUrl(branch.mapUrl);

          return (
            <Reveal key={branch._id.toString()} delay={index * 0.05}>
              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="relative min-h-[280px] bg-[#0B1F3A] chess-bg lg:min-h-[430px]">
                    {branch.image ? (
                      <Image src={branch.image} alt={branch.name} fill className="object-cover" />
                    ) : mapEmbedSrc ? (
                      <iframe
                        src={mapEmbedSrc}
                        className="absolute inset-0 h-full w-full border-0"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        title={translate('ru', 'branches.mapTitle', { name: branch.name })}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F59E0B] shadow-xl shadow-amber-500/25">
                          <MapPin className="h-10 w-10 text-[#0B1F3A]" />
                        </div>
                        <p className="font-display text-2xl font-bold text-white">
                          <DynamicText text={branch.city} cacheKey={`branch-city-${branch._id}`} />
                        </p>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
                          <DynamicText text={branch.address} cacheKey={`branch-address-${branch._id}`} />
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div>
                      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                        <Navigation className="h-3.5 w-3.5" />
                        <DynamicText text={branch.city} cacheKey={`branch-city-pill-${branch._id}`} />
                      </div>
                      <h2 className="font-display text-3xl font-bold leading-tight text-[#0B1F3A]">
                        <DynamicText text={branch.name} cacheKey={`branch-name-${branch._id}`} />
                      </h2>

                      <div className="mt-6 grid gap-4 text-sm font-medium text-slate-700">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
                          <span>
                            <DynamicText text={`${branch.address}, ${branch.city}`} cacheKey={`branch-full-address-${branch._id}`} />
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 shrink-0 text-[#F59E0B]" />
                          <a href={`tel:${branch.phone}`} className="transition-colors hover:text-[#1D4ED8]">
                            {branch.phone}
                          </a>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
                          <span><DynamicText text={branch.schedule} cacheKey={`branch-schedule-${branch._id}`} /></span>
                        </div>
                      </div>

                      {coaches.length > 0 && (
                        <div className="mt-7">
                          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            <Users className="h-4 w-4 text-[#F59E0B]" />
                            <T k="branches.coaches" />
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {coaches.map((coach: any) => (
                              <span
                                key={coach._id.toString()}
                                className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1D4ED8]"
                              >
                                {coach.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Link href={`/enroll?branch=${branch._id.toString()}`} className="btn-primary px-6 py-3 text-sm">
                        <T k="branches.enroll" />
                      </Link>
                      {branch.whatsapp && (
                        <a
                          href={getWhatsAppUrl(translate('ru', 'whatsappMessages.branchEnroll', { branch: branch.name }))}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-50 px-6 py-3 text-sm font-bold text-green-700 transition-all hover:-translate-y-0.5 hover:bg-green-100 hover:shadow-lg"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                      )}
                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-6 py-3 text-sm font-bold text-[#1D4ED8] transition-all hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-lg"
                        >
                          <Map className="h-4 w-4" />
                          <T k="branches.map" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </main>
    </div>
  );
}
