import Link from 'next/link';
import { Crown } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-royal-gradient chess-bg flex flex-col items-center justify-center p-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <Link href="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
          <Crown className="w-5 h-5 text-king-navy" />
        </div>
        <div className="leading-tight">
          <span className="font-display text-xl font-bold text-white">Chess</span>
          <span className="font-display text-xl font-bold text-king-gold">King</span>
        </div>
      </Link>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  );
}
