import type { Metadata } from 'next';
import { Playfair_Display, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/providers/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chessking.kz'),
  title: {
    default: 'ChessKing — Шахматная Академия',
    template: '%s | ChessKing',
  },
  description:
    'ChessKing — ведущая шахматная академия Казахстана. Профессиональные тренеры, турниры, кружки для детей и взрослых.',
  keywords: ['шахматы', 'шахматная академия', 'Chess King', 'шахматы Астана', 'обучение шахматам'],
  openGraph: {
    type: 'website',
    locale: 'ru_KZ',
    siteName: 'ChessKing',
    title: 'ChessKing — Шахматная Академия',
    description: 'Профессиональные тренеры, турниры и занятия для всех уровней.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'ChessKing Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChessKing Academy',
    description: 'Шахматная академия нового поколения',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F1B3D',
                color: '#FAFAFA',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#F59E0B', secondary: '#0F1B3D' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#FAFAFA' },
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
