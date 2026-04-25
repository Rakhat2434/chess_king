'use client';

import Link from 'next/link';
import { Crown, MapPin, Phone, Instagram, MessageCircle, Mail, ChevronRight } from 'lucide-react';
import { DISPLAY_PHONE, getWhatsAppUrl, INSTAGRAM_URL, PHONE_HREF } from '@/lib/utils';

const footerLinks = [
  { href: '/', label: 'Главная' },
  { href: '/news', label: 'Новости' },
  { href: '/tournaments', label: 'Турниры' },
  { href: '/branches', label: 'Филиалы' },
  { href: '/coaches', label: 'Тренеры' },
  { href: '/enroll', label: 'Записаться' },
  { href: '/about', label: 'О нас' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-king-dark text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
                <Crown className="w-5 h-5 text-king-navy" />
              </div>
              <div className="leading-tight">
                <span className="font-display text-xl font-bold text-white">Chess</span>
                <span className="font-display text-xl font-bold text-king-gold">King</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Ведущая шахматная академия Казахстана. Профессиональные тренеры, турниры и занятия для всех возрастов.
            </p>
            <div className="flex gap-3">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-green-600 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 rounded-xl flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Навигация</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-king-gold transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 text-king-gold/50 group-hover:text-king-gold transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Контакты</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={PHONE_HREF}
                  className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 text-king-gold flex-shrink-0" />
                  {DISPLAY_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-green-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@chessking.kz"
                  className="flex items-start gap-2.5 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 text-king-gold flex-shrink-0" />
                  info@chessking.kz
                </a>
              </li>
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h4 className="font-display text-white font-semibold mb-4 text-base">Филиалы</h4>
            <ul className="space-y-3">
              {[
                { name: 'Филиал №1 — Есиль', addr: 'ул. Сауран, 24' },
                { name: 'Филиал №2 — Алматы', addr: 'пр. Достык, 162' },
                { name: 'Филиал №3 — Байконур', addr: 'ул. Абая, 10' },
              ].map((b) => (
                <li key={b.name} className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-king-gold flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white/80">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.addr}</p>
                  </div>
                </li>
              ))}
              <li>
                <Link href="/branches" className="text-xs text-king-gold hover:text-gold-300 transition-colors">
                  Все филиалы →
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} ChessKing Academy. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/enroll" className="text-xs text-gray-400 hover:text-king-gold transition-colors">
              Записаться на урок
            </Link>
            <span className="text-gray-700">·</span>
            <p className="text-xs text-gray-600">Made with ♟ in Kazakhstan</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
