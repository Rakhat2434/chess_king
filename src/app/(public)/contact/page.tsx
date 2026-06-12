import { Metadata } from 'next';
import { Phone, MessageCircle, Instagram, Mail, MapPin, Clock } from 'lucide-react';
import { DISPLAY_PHONE, getWhatsAppUrl, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_HREF } from '@/lib/utils';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import { translate } from '@/lib/i18n';
import T from '@/components/i18n/T';
import DynamicText from '@/components/i18n/DynamicText';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: translate('ru', 'contact.metaTitle'),
  description: translate('ru', 'contact.metaDescription'),
};

export default async function ContactPage() {
  await connectDB();
  const branches = await Branch.find({ isActive: true }).lean();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-royal-gradient chess-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-3"><T k="contact.badge" /></p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4"><T k="contact.title" /></h1>
          <p className="text-gray-300 text-lg"><T k="contact.subtitle" /></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact methods */}
          <div>
            <h2 className="font-display text-2xl font-bold text-king-navy mb-6"><T k="contact.methodsTitle" /></h2>
            <div className="space-y-4">
              {[
                {
                  icon: Phone, color: 'bg-blue-50 text-blue-600',
                  labelKey: 'common.phone', value: DISPLAY_PHONE,
                  href: PHONE_HREF,
                },
                {
                  icon: MessageCircle, color: 'bg-green-50 text-green-600',
                  labelKey: 'common.whatsapp', valueKey: 'contact.writeWhatsapp',
                  href: getWhatsAppUrl(translate('ru', 'whatsappMessages.contact')),
                  external: true,
                },
                {
                  icon: Instagram, color: 'bg-pink-50 text-pink-600',
                  labelKey: 'common.instagram', value: INSTAGRAM_HANDLE,
                  href: INSTAGRAM_URL,
                  external: true,
                },
                {
                  icon: Mail, color: 'bg-purple-50 text-purple-600',
                  labelKey: 'common.email', value: 'info@chessking.kz',
                  href: 'mailto:info@chessking.kz',
                },
              ].map(({ icon: Icon, color, labelKey, value, valueKey, href, external }) => (
                <a
                  key={labelKey}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all group"
                >
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-king-gray font-semibold uppercase tracking-widest mb-0.5"><T k={labelKey} /></p>
                    <p className="font-medium text-king-navy">{valueKey ? <T k={valueKey} /> : value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div>
            <h2 className="font-display text-2xl font-bold text-king-navy mb-6"><T k="contact.addressesTitle" /></h2>
            <div className="space-y-4">
              {branches.map((b: any) => (
                <div key={b._id.toString()} className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-bold text-king-navy mb-3">
                    <DynamicText text={b.name} cacheKey={`branch-name-${b._id}`} />
                  </h3>
                  <div className="space-y-2 text-sm text-king-gray">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-king-gold mt-0.5 flex-shrink-0" />
                      <DynamicText text={`${b.address}, ${b.city}`} cacheKey={`branch-full-address-${b._id}`} />
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-king-gold flex-shrink-0" />
                      <a href={`tel:${b.phone}`} className="hover:text-king-navy transition-colors">{b.phone}</a>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-king-gold mt-0.5 flex-shrink-0" />
                      <DynamicText text={b.schedule} cacheKey={`branch-schedule-${b._id}`} />
                    </p>
                  </div>
                </div>
              ))}
              {branches.length === 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6 text-center text-king-gray">
                  <p><T k="contact.addressesEmpty" /></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 bg-royal-gradient chess-bg rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3"><T k="contact.ctaTitle" /></h2>
          <p className="text-gray-300 mb-8"><T k="contact.ctaText" /></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/enroll" className="btn-gold text-base px-8 py-3.5">
              <T k="contact.ctaButton" />
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-all font-semibold"
            >
              <MessageCircle className="w-5 h-5 text-green-400" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
