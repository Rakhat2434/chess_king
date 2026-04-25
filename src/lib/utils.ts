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
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
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
