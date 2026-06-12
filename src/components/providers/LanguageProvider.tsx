'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  isLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
  type TranslationValues,
  translate,
  translateMessage,
} from '@/lib/i18n';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, values?: TranslationValues, fallback?: string) => string;
  message: (value: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(storedLanguage)) {
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage === 'kz' ? 'kk' : 'ru';
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage === 'kz' ? 'kk' : 'ru';
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'ru' ? 'kz' : 'ru'),
      t: (key, values, fallback) => translate(language, key, values, fallback),
      message: (message) => translateMessage(message, language),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used inside LanguageProvider');
  }
  return context;
}
