import { Metadata } from 'next';
import { Phone, MessageCircle, Instagram, Mail, MapPin, Clock } from 'lucide-react';
import { DISPLAY_PHONE, getWhatsAppUrl, INSTAGRAM_HANDLE, INSTAGRAM_URL, PHONE_HREF } from '@/lib/utils';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Контакты шахматной академии ChessKing',
};

export default async function ContactPage() {
  await connectDB();
  const branches = await Branch.find({ isActive: true }).lean();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-royal-gradient chess-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-3">Свяжитесь с нами</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Контакты</h1>
          <p className="text-gray-300 text-lg">Мы всегда рады ответить на ваши вопросы</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Contact methods */}
          <div>
            <h2 className="font-display text-2xl font-bold text-king-navy mb-6">Как с нами связаться</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Phone, color: 'bg-blue-50 text-blue-600',
                  label: 'Телефон', value: DISPLAY_PHONE,
                  href: PHONE_HREF,
                },
                {
                  icon: MessageCircle, color: 'bg-green-50 text-green-600',
                  label: 'WhatsApp', value: 'Написать в WhatsApp',
                  href: getWhatsAppUrl('Здравствуйте! Хочу узнать о ChessKing'),
                  external: true,
                },
                {
                  icon: Instagram, color: 'bg-pink-50 text-pink-600',
                  label: 'Instagram', value: INSTAGRAM_HANDLE,
                  href: INSTAGRAM_URL,
                  external: true,
                },
                {
                  icon: Mail, color: 'bg-purple-50 text-purple-600',
                  label: 'Email', value: 'info@chessking.kz',
                  href: 'mailto:info@chessking.kz',
                },
              ].map(({ icon: Icon, color, label, value, href, external }) => (
                <a
                  key={label}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all group"
                >
                  <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-king-gray font-semibold uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="font-medium text-king-navy">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Branches */}
          <div>
            <h2 className="font-display text-2xl font-bold text-king-navy mb-6">Наши адреса</h2>
            <div className="space-y-4">
              {branches.map((b: any) => (
                <div key={b._id.toString()} className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-display font-bold text-king-navy mb-3">{b.name}</h3>
                  <div className="space-y-2 text-sm text-king-gray">
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-king-gold mt-0.5 flex-shrink-0" />
                      {b.address}, {b.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-king-gold flex-shrink-0" />
                      <a href={`tel:${b.phone}`} className="hover:text-king-navy transition-colors">{b.phone}</a>
                    </p>
                    <p className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-king-gold mt-0.5 flex-shrink-0" />
                      {b.schedule}
                    </p>
                  </div>
                </div>
              ))}
              {branches.length === 0 && (
                <div className="bg-white rounded-2xl shadow-card p-6 text-center text-king-gray">
                  <p>Адреса появятся скоро</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 bg-royal-gradient chess-bg rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Готовы начать?</h2>
          <p className="text-gray-300 mb-8">Запишитесь на бесплатное пробное занятие прямо сейчас</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/enroll" className="btn-gold text-base px-8 py-3.5">
              Записаться на урок
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
