'use client';

import type { InputHTMLAttributes } from 'react';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  placeholderKey: string;
}

export default function TranslatedInput({ placeholderKey, ...props }: Props) {
  const { t } = useTranslation();
  return <input {...props} placeholder={t(placeholderKey)} />;
}
