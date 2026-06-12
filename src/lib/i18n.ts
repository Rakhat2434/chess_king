import ru from '@/locales/ru.json';
import kz from '@/locales/kz.json';

export const LANGUAGES = ['ru', 'kz'] as const;
export type Language = (typeof LANGUAGES)[number];
export type TranslationValues = Record<string, string | number | null | undefined>;

export const LANGUAGE_STORAGE_KEY = 'chessking-language';

const dictionaries: Record<Language, typeof ru> = { ru, kz };

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

export function getDictionary(language: Language) {
  return dictionaries[language] || dictionaries.ru;
}

export function translate(
  language: Language,
  key: string,
  values?: TranslationValues,
  fallback?: string
) {
  const raw = getByPath(getDictionary(language), key) ?? getByPath(dictionaries.ru, key) ?? fallback ?? key;
  return interpolate(String(raw), values);
}

export function translateMessage(message: string, language: Language) {
  if (!message || language === 'ru') return message;
  const translated = getByPath(getDictionary(language), `serverMessages.${message}`);
  return typeof translated === 'string' ? translated : message;
}

function getByPath(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[part];
  }, source);
}

function interpolate(text: string, values?: TranslationValues) {
  if (!values) return text;

  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = values[name];
    return value === null || value === undefined ? '' : String(value);
  });
}
