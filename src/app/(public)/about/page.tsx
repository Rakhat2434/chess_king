import { Metadata } from 'next';
import Image from 'next/image';
import connectDB from '@/lib/db';
import Coach from '@/models/Coach';
import { Champion } from '@/models/index';
import { Crown, Target, Heart, Star, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'О нас',
  description: 'История и миссия шахматной академии ChessKing',
};

export default async function AboutPage() {
  await connectDB();
  const [coaches, champions] = await Promise.all([
    Coach.find({ isActive: true }).sort({ order: 1 }).limit(6).populate('branch', 'name').lean(),
    Champion.find().sort({ year: -1, order: 1 }).lean(),
  ]);

  const values = [
    {
      icon: Target,
      title: 'Наша миссия',
      desc: 'Развивать интеллект, логическое мышление и стратегическое видение через шахматы. Мы верим, что шахматы — это не просто игра, а инструмент воспитания чемпионского мышления.',
    },
    {
      icon: Heart,
      title: 'Наш подход',
      desc: 'Индивидуальное внимание к каждому ученику, современные методики обучения, позитивная атмосфера и постоянная мотивация к развитию.',
    },
    {
      icon: Star,
      title: 'Наши ценности',
      desc: 'Честность, настойчивость, уважение к сопернику. Победа важна, но важнее — характер, который формируется в процессе борьбы.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-royal-gradient chess-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-3">С 2015 года</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">О ChessKing</h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                ChessKing — ведущая шахматная академия Казахстана, основанная в 2015 году с целью сделать профессиональное обучение шахматам доступным для каждого.
              </p>
              <p className="text-gray-400 leading-relaxed">
                За 9 лет работы мы подготовили сотни учеников, организовали десятки турниров и создали сообщество настоящих любителей шахматного искусства. Наши воспитанники участвуют в национальных и международных соревнованиях.
              </p>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { icon: Crown, val: '2015', label: 'Год основания' },
                { icon: Trophy, val: '120+', label: 'Турниров' },
                { icon: Star, val: '500+', label: 'Выпускников' },
                { icon: Heart, val: '3', label: 'Города' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <Icon className="w-8 h-8 text-king-gold mx-auto mb-3" />
                  <p className="font-display text-2xl font-bold text-white">{val}</p>
                  <p className="text-gray-300 text-sm mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Наши принципы</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-card transition-shadow">
                <div className="w-14 h-14 bg-royal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-king-blue" />
                </div>
                <h3 className="font-display text-xl font-bold text-king-navy mb-3">{title}</h3>
                <p className="text-king-gray leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      {coaches.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">Наши тренеры</h2>
              <p className="section-subtitle">Профессионалы с богатым опытом</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((c: any) => (
                <div key={c._id.toString()} className="card text-center p-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-royal-200 to-royal-300 overflow-hidden mx-auto mb-4">
                    {c.photo ? (
                      <Image src={c.photo} alt={c.name} width={80} height={80} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-2xl font-bold text-royal-600">
                        {c.name[0]}
                      </div>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-king-navy">{c.name}</h3>
                  <p className="text-king-gold text-sm font-medium mt-1">{c.title}</p>
                  <p className="text-king-gray text-xs mt-1">{c.experience} лет опыта</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Champions */}
      {champions.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">Наши чемпионы</h2>
              <p className="section-subtitle">Гордость ChessKing</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {champions.map((ch: any) => (
                <div key={ch._id.toString()} className="card p-5 text-center group">
                  <div className="w-16 h-16 rounded-full bg-gold-50 overflow-hidden mx-auto mb-3 border-2 border-king-gold/30">
                    {ch.photo ? (
                      <Image src={ch.photo} alt={ch.name} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-king-gold text-2xl">
                        🏆
                      </div>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-king-navy text-sm">{ch.name}</h4>
                  <p className="text-king-gold text-xs font-medium mt-0.5">{ch.year}</p>
                  <p className="text-king-gray text-xs mt-1 leading-relaxed">{ch.achievement}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
