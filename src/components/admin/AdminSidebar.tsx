'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Crown, LayoutDashboard, Newspaper, Trophy, MapPin,
  Users, ClipboardList, MessageSquare, LogOut, Menu, X, ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/news', label: 'Новости', icon: Newspaper },
  { href: '/admin/tournaments', label: 'Турниры', icon: Trophy },
  { href: '/admin/tournament-registrations', label: 'Заявки на турниры', icon: ClipboardCheck },
  { href: '/admin/branches', label: 'Филиалы', icon: MapPin },
  { href: '/admin/coaches', label: 'Тренеры', icon: Users },
  { href: '/admin/enrollments', label: 'Заявки', icon: ClipboardList },
  { href: '/admin/comments', label: 'Комментарии', icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gold-gradient rounded-lg flex items-center justify-center">
            <Crown className="w-5 h-5 text-king-navy" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white">Chess</span>
            <span className="font-display text-lg font-bold text-king-gold">King</span>
            <p className="text-gray-400 text-xs -mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              isActive(href, exact)
                ? 'bg-king-blue text-white shadow-royal'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white text-sm transition-colors mb-1"
        >
          ← На сайт
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-red-400 text-sm transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-king-navy rounded-lg text-white shadow-lg"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-64 z-40 bg-king-navy transition-transform duration-300 lg:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-king-navy z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
