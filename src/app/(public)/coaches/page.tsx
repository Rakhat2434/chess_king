import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import connectDB from '@/lib/db';
import Coach from '@/models/Coach';
import { User, Trophy, BookOpen, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Тренеры',
  description: 'Наши опытные шахматные тренеры',
};

export default async function CoachesPage() {
  await connectDB();
  const coaches = await Coach.find({ isActive: true })
    .sort({ order: 1 })
    .populate('branch', 'name')
    .lean();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-royal-gradient chess-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-king-gold font-semibold text-sm uppercase tracking-widest mb-3">Наша команда</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Тренеры</h1>
          <p className="text-gray-300 text-lg">Профессионалы с многолетним опытом</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {coaches.length === 0 && (
          <div className="text-center py-20 text-king-gray">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="font-display text-xl">Тренеры скоро появятся</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach: any) => (
            <div key={coach._id.toString()} className="card group flex h-full flex-col">
              {/* Photo */}
              <div className="relative h-64 shrink-0 bg-gradient-to-br from-royal-100 to-royal-200 overflow-hidden">
                {coach.photo ? (
                  <Image
                    src={coach.photo}
                    alt={coach.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-white/50" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-king-navy/80 p-4">
                  <span className="text-king-gold text-xs font-semibold">{coach.title}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-lg font-bold text-king-navy mb-1">{coach.name}</h2>
                {coach.branch && (
                  <p className="text-xs text-king-gray flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-king-gold" />
                    {coach.branch.name}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-king-gray mb-3">
                  <BookOpen className="w-3.5 h-3.5 text-king-gold" />
                  Опыт: <span className="font-semibold text-king-navy">{coach.experience} лет</span>
                </div>

                <p className="text-sm text-king-gray leading-relaxed mb-4 line-clamp-3">{coach.bio}</p>

                {coach.achievements?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-king-gray uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-king-gold" />
                      Достижения
                    </p>
                    <ul className="space-y-1">
                      {coach.achievements.slice(0, 2).map((a: string, i: number) => (
                        <li key={i} className="text-xs text-king-gray flex items-start gap-1.5">
                          <span className="text-king-gold mt-0.5">•</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  href={`/enroll?coach=${coach._id.toString()}&branch=${coach.branch?._id || ''}`}
                  className="btn-primary mt-auto w-full justify-center text-sm py-2.5"
                >
                  Записаться к тренеру
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
