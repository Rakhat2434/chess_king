'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/components/providers/LanguageProvider';

type TagName = 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'li';

interface Props {
  text?: string | null;
  as?: TagName;
  className?: string;
  cacheKey?: string;
}

export default function DynamicText({ text, as: Tag = 'span', className }: Props) {
  const { language } = useTranslation();
  const original = text || '';
  const [translated, setTranslated] = useState(original);

  useEffect(() => {
    let alive = true;

    if (!original || language === 'ru') {
      setTranslated(original);
      return () => {
        alive = false;
      };
    }

    setTranslated(original);

    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [original], targetLanguage: language }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data.translations) ? data.translations[0] : null;
      })
      .then((value) => {
        if (!alive || typeof value !== 'string' || !value.trim()) return;
        setTranslated(value);
      })
      .catch(() => {
        if (alive) setTranslated(original);
      });

    return () => {
      alive = false;
    };
  }, [language, original]);

  return <Tag className={className}>{translated}</Tag>;
}
