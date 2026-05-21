import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import slugify from 'slugify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return format(new Date(date), 'd MMMM yyyy', { locale: ru });
}

export function formatDateShort(date: Date | string) {
  return format(new Date(date), 'd MMM yyyy', { locale: ru });
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { locale: ru, addSuffix: true });
}

export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'ru',
    replacement: '-',
  });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getExcerpt(text: string, length = 160): string {
  // Strip HTML tags if any
  const stripped = text.replace(/<[^>]*>/g, '');
  return truncate(stripped, length);
}

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77755092977';
export const DISPLAY_PHONE = '+7 775 509 2977';
export const PHONE_HREF = 'tel:+77755092977';
export const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_URL || `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_HANDLE = '@king.academy.kz';
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
  'https://www.instagram.com/king.academy.kz?igsh=MTlwZ3BnbXpjcnFvZg==';

export function getWhatsAppUrl(message?: string): string {
  if (message) return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  return WHATSAPP_URL;
}

export function getShareUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://chessking.kz';
  return `${base}${path}`;
}

export function getGoogleMapsEmbedSrc(
  mapEmbed?: string | null,
  fallbackQueryParts: Array<string | null | undefined> = []
): string | null {
  const rawValue = mapEmbed?.trim();
  const srcMatch = rawValue?.match(/\bsrc=["']([^"']+)["']/i);
  const candidate = decodeHtmlAttribute(srcMatch?.[1] || rawValue || '');
  const fallbackQuery = fallbackQueryParts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

  if (candidate) {
    const normalized = normalizeGoogleMapsEmbedUrl(candidate, fallbackQuery);
    if (normalized) return normalized;
  }

  if (!fallbackQuery) return null;

  return buildGoogleMapsSearchEmbedUrl(fallbackQuery);
}

export function getSafeGoogleMapsUrl(mapUrl?: string | null): string | null {
  const candidate = decodeHtmlAttribute(mapUrl?.trim() || '');
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (url.protocol !== 'https:') return null;
    if (isGoogleMapsHost(url.hostname) || host === 'maps.app.goo.gl' || host === 'goo.gl') {
      return url.toString();
    }

    return null;
  } catch {
    return null;
  }
}

function normalizeGoogleMapsEmbedUrl(value: string, fallbackQuery: string): string | null {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:' || !isGoogleMapsHost(url.hostname)) return null;

    if (url.pathname.startsWith('/maps/embed')) return url.toString();

    if (url.pathname === '/maps' && (url.searchParams.has('q') || url.searchParams.get('output') === 'embed')) {
      url.searchParams.set('output', 'embed');
      return url.toString();
    }

    const query =
      url.searchParams.get('q') ||
      url.searchParams.get('query') ||
      getGoogleMapsPathQuery(url) ||
      getGoogleMapsCoordinateQuery(value) ||
      fallbackQuery;

    return query ? buildGoogleMapsSearchEmbedUrl(query) : null;
  } catch {
    return null;
  }
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '');
  return /^(maps\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
}

function getGoogleMapsPathQuery(url: URL): string | null {
  const parts = url.pathname.split('/').filter(Boolean);
  const querySegmentIndex = parts.findIndex((part) => part === 'place' || part === 'search');
  const querySegment = querySegmentIndex >= 0 ? parts[querySegmentIndex + 1] : null;

  if (!querySegment) return null;

  try {
    return decodeURIComponent(querySegment.replace(/\+/g, ' '));
  } catch {
    return querySegment.replace(/\+/g, ' ');
  }
}

function getGoogleMapsCoordinateQuery(value: string): string | null {
  const dataCoordinates = value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dataCoordinates) return `${dataCoordinates[1]},${dataCoordinates[2]}`;

  const atCoordinates = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,|\/|$)/);
  if (atCoordinates) return `${atCoordinates[1]},${atCoordinates[2]}`;

  return null;
}

function buildGoogleMapsSearchEmbedUrl(query: string): string {
  const fallbackUrl = new URL('https://www.google.com/maps');
  fallbackUrl.searchParams.set('q', query);
  fallbackUrl.searchParams.set('output', 'embed');
  return fallbackUrl.toString();
}
