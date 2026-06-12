'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';
import type { Language } from '@/lib/i18n';

interface Props {
  className?: string;
  compact?: boolean;
}

const languages: Language[] = ['ru', 'kz'];

export default function LanguageSwitcher({ className, compact }: Props) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center rounded-xl border border-white/15 bg-white/10 p-1 text-xs font-bold backdrop-blur',
        compact && 'rounded-lg p-0.5',
        className
      )}
      aria-label={t('language.switchLabel')}
    >
      {languages.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLanguage(item)}
          className={cn(
            'rounded-lg px-2.5 py-1.5 transition-all',
            compact && 'px-2 py-1',
            language === item
              ? 'bg-[#F59E0B] text-[#0B1F3A] shadow-sm'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          )}
          aria-pressed={language === item}
        >
          {t(`language.${item}`)}
        </button>
      ))}
    </div>
  );
}
