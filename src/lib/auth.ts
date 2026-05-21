import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from './db';
import User from '@/models/User';
import { normalizeEmailAddress } from './validators';
import { checkRateLimit, getClientIpFromHeaders } from './security';

const ROLE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Введите email и пароль');
        }

        const rawEmail = credentials.email.trim().toLowerCase();
        const email = normalizeEmailAddress(rawEmail) || rawEmail;
        const ip = getClientIpFromHeaders(req?.headers);
        const [ipLimit, accountLimit] = await Promise.all([
          checkRateLimit({
            keyPrefix: 'auth:login:ip',
            identifier: ip,
            limit: 20,
            windowMs: 15 * 60 * 1000,
          }),
          checkRateLimit({
            keyPrefix: 'auth:login:account',
            identifier: email,
            limit: 8,
            windowMs: 15 * 60 * 1000,
          }),
        ]);

        if (ipLimit.limited || accountLimit.limited) {
          throw new Error('Слишком много попыток входа. Попробуйте позже.');
        }

        await connectDB();
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          throw new Error('Неверный email или пароль');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Неверный email или пароль');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      const shouldRefreshRole =
        token.id &&
        (!token.roleCheckedAt || Date.now() - Number(token.roleCheckedAt) > ROLE_REFRESH_INTERVAL_MS);

      if (shouldRefreshRole) {
        try {
          await connectDB();
          const existing = await User.findById(token.id).select('role').lean();
          token.role = existing?.role === 'admin' ? 'admin' : 'user';
          token.roleCheckedAt = Date.now();
        } catch {
          // Keep the current token role if the database is temporarily unreachable.
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
