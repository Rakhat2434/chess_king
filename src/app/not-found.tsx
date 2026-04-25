'use client';

import Link from 'next/link';
import { Crown, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-royal-gradient chess-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Crown className="w-12 h-12 text-king-gold" />
        </div>
        <h1 className="font-display text-8xl font-bold text-white mb-4">404</h1>
        <h2 className="font-display text-2xl font-semibold text-white mb-4">Страница не найдена</h2>
        <p className="text-gray-300 mb-10 leading-relaxed">
          Похоже, вы сделали ход в сторону несуществующей страницы. Вернитесь на доску!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-gold text-base px-8 py-3.5">
            <Home className="w-5 h-5" />
            На главную
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-all text-base font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}
