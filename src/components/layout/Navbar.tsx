'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crown, LayoutDashboard, LogOut, Menu, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const navLinks = [
  { href: '/', labelKey: 'nav.home' },
  { href: '/news', labelKey: 'nav.news' },
  { href: '/tournaments', labelKey: 'nav.tournaments' },
  { href: '/branches', labelKey: 'nav.branches' },
  { href: '/coaches', labelKey: 'nav.coaches' },
  { href: '/enroll', labelKey: 'nav.enroll' },
  { href: '/about', labelKey: 'nav.about' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href));

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-white/10 bg-[#071020]/90 shadow-xl shadow-slate-950/20 backdrop-blur-xl'
          : 'border-white/10 bg-[#071020]/95 backdrop-blur-xl'
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B] shadow-lg shadow-amber-500/25 transition-transform duration-300 group-hover:scale-105">
              <Crown className="h-5 w-5 text-[#0B1F3A]" />
            </div>
            <div className="leading-tight">
              <span className="font-display text-xl font-bold tracking-tight text-white">Chess</span>
              <span className="font-display text-xl font-bold tracking-tight text-[#F59E0B]">King</span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-300',
                  isActive(link.href)
                    ? 'bg-white/10 text-[#F59E0B]'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                {t(link.labelKey)}
                {isActive(link.href) && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#F59E0B]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            {session ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="btn-primary px-4 py-2 text-sm">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.admin')}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition-all duration-300 hover:bg-white/10 hover:text-white"
                >
                  <User className="h-4 w-4" />
                  {session.user?.name?.split(' ')[0] || t('nav.dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="btn-primary px-5 py-2 text-sm">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-xl p-2 text-slate-200 transition-all duration-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={t('nav.openMenu')}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 lg:hidden"
            >
              <div className="grid gap-2 py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                      isActive(link.href)
                        ? 'bg-white/10 text-[#F59E0B]'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                ))}

                <div className="mt-2 grid gap-2 border-t border-white/10 pt-4">
                  <LanguageSwitcher className="w-fit" />
                  {session ? (
                    <>
                      {isAdmin && (
                        <Link href="/admin" className="btn-primary justify-center py-3 text-sm">
                          <LayoutDashboard className="h-4 w-4" />
                          {t('nav.adminPanel')}
                        </Link>
                      )}
                      <Link href="/dashboard" className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white">
                        {t('nav.personalDashboard')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="btn-outline justify-center border-white/20 bg-white/5 py-3 text-sm text-white hover:bg-white hover:text-[#0B1F3A]">
                        {t('nav.login')}
                      </Link>
                      <Link href="/register" className="btn-primary justify-center py-3 text-sm">
                        {t('nav.register')}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
