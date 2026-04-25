import { Metadata } from 'next';
import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import Coach from '@/models/Coach';
import EnrollForm from '@/components/forms/EnrollForm';
import { Crown, Phone, MessageCircle, Instagram, MapPin, Clock } from 'lucide-react';
import { DISPLAY_PHONE, getWhatsAppUrl, INSTAGRAM_URL, PHONE_HREF } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Записаться на занятия',
  description: 'Запишитесь на шахматные занятия в ChessKing',
};

interface Props {
  searchParams: { branch?: string; coach?: string };
}

export default async function EnrollPage({ searchParams }: Props) {
  await connectDB();
  const [branches, coaches] = await Promise.all([
    Branch.find({ isActive: true }).lean(),
    Coach.find({ isActive: true }).populate('branch', 'name').lean(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-royal-gradient chess-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-3">Первый шаг</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Записаться к нам</h1>
          <p className="text-gray-300 text-lg">Первое занятие — бесплатно. Подберём группу под ваш уровень.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-card p-8">
              <h2 className="font-display text-2xl font-bold text-king-navy mb-6">Заявка на обучение</h2>
              <EnrollForm
                branches={JSON.parse(JSON.stringify(branches))}
                coaches={JSON.parse(JSON.stringify(coaches))}
                defaultBranch={searchParams.branch}
                defaultCoach={searchParams.coach}
              />
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-display text-lg font-semibold text-king-navy mb-4">Связаться с нами</h3>
              <div className="space-y-3">
                <a
                  href={PHONE_HREF}
                  className="flex items-center gap-3 text-sm text-king-gray hover:text-king-navy transition-colors"
                >
                  <div className="w-9 h-9 bg-royal-50 rounded-xl flex items-center justify-center">
                    <Phone className="w-4 h-4 text-king-blue" />
                  </div>
                  {DISPLAY_PHONE}
                </a>
                <a
                  href={getWhatsAppUrl('Хочу записаться на занятия')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-king-gray hover:text-green-600 transition-colors"
                >
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  WhatsApp
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-king-gray hover:text-pink-600 transition-colors"
                >
                  <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-pink-600" />
                  </div>
                  Instagram
                </a>
              </div>
            </div>

            {/* Branches */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-display text-lg font-semibold text-king-navy mb-4">Наши филиалы</h3>
              <div className="space-y-4">
                {branches.map((b: any) => (
                  <div key={b._id.toString()} className="border-l-2 border-king-gold pl-4">
                    <p className="font-semibold text-king-navy text-sm">{b.name}</p>
                    <p className="text-xs text-king-gray flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {b.address}
                    </p>
                    <p className="text-xs text-king-gray flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {b.schedule}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA direct */}
            <div className="bg-royal-gradient chess-bg rounded-2xl p-6 text-center">
              <Crown className="w-8 h-8 text-king-gold mx-auto mb-3" />
              <p className="font-display text-white font-bold text-base mb-2">Первый урок бесплатно</p>
              <p className="text-gray-300 text-xs mb-4">Оцените наш подход без обязательств</p>
              <a
                href={getWhatsAppUrl('Хочу пробный урок бесплатно!')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold text-sm py-2.5 w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                Написать сейчас
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
