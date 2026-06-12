'use client';

import { type TranslationValues } from '@/lib/i18n';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface Props {
  k: string;
  values?: TranslationValues;
  fallback?: string;
}

export default function T({ k, values, fallback }: Props) {
  const { t } = useTranslation();
  return <>{t(k, values, fallback)}</>;
}
