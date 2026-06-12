'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface DateProps {
  value: string | Date;
  format?: 'long' | 'short';
}

interface RangeProps {
  start: string | Date;
  end?: string | Date | null;
  format?: 'long' | 'short';
}

export default function LocalizedDate({ value, format = 'long' }: DateProps) {
  const { language } = useTranslation();

  return <>{formatDateForLanguage(value, language, format)}</>;
}

export function LocalizedDateRange({ start, end, format = 'long' }: RangeProps) {
  const { language } = useTranslation();
  const label = useMemo(() => {
    const startLabel = formatDateForLanguage(start, language, format);
    if (!end) return startLabel;
    return `${startLabel} — ${formatDateForLanguage(end, language, format)}`;
  }, [end, format, language, start]);

  return <>{label}</>;
}

function formatDateForLanguage(value: string | Date, language: 'ru' | 'kz', format: 'long' | 'short') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(language === 'kz' ? 'kk-KZ' : 'ru-RU', {
    day: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    year: 'numeric',
  }).format(date);
}
