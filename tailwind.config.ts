import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ChessKing Brand Colors
        royal: {
          50:  '#eef3ff',
          100: '#dce7ff',
          200: '#bfd0ff',
          300: '#93aeff',
          400: '#6080ff',
          500: '#3d57f5',
          600: '#2535ea',
          700: '#1d27d0',
          800: '#1e24a8',
          900: '#1e2585',
          950: '#141650',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        king: {
          navy:   '#0B1F3A',
          blue:   '#1D4ED8',
          light:  '#3B82F6',
          gold:   '#F59E0B',
          golden: '#FCD34D',
          white:  '#FFFFFF',
          gray:   '#475569',
          dark:   '#071020',
        }
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'chess-pattern': "url('/chess-bg.svg')",
        'royal-gradient': 'linear-gradient(135deg, #0B1F3A 0%, #123B69 52%, #071020 100%)',
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #FBBF24 100%)',
      },
      boxShadow: {
        'royal': '0 24px 70px rgba(11, 31, 58, 0.24)',
        'gold': '0 18px 45px rgba(245, 158, 11, 0.28)',
        'card': '0 18px 45px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 28px 70px rgba(15, 23, 42, 0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
