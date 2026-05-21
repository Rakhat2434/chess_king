import { NextRequest, NextResponse } from 'next/server';
import { resolve4, resolveMx } from 'node:dns/promises';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { jsonError } from '@/lib/api';
import { isHoneypotFilled, rateLimit, validatePasswordPolicy } from '@/lib/security';
import { normalizeEmailAddress, normalizeKazakhstanPhone } from '@/lib/validators';

async function hasEmailDomainRecords(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;

  const timeout = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), 2500);
  });

  const lookup = async () => {
    try {
      const mxRecords = await resolveMx(domain);
      if (mxRecords.length > 0) return true;
    } catch {
      // Some domains accept mail through A records without MX.
    }

    try {
      const addressRecords = await resolve4(domain);
      return addressRecords.length > 0;
    } catch {
      return false;
    }
  };

  return Promise.race([lookup(), timeout]);
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().max(254),
  phone: z.string().trim().min(1).max(40),
  password: z.string().min(1).max(128),
  website: z.string().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, {
    keyPrefix: 'auth:register',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (limited) return limited;

  try {
    const parsed = registerSchema.safeParse(await req.json());

    if (!parsed.success) {
      return jsonError('Проверьте корректность заполнения полей');
    }

    if (isHoneypotFilled(parsed.data.website)) {
      return NextResponse.json({ success: true });
    }

    const { name, phone, password } = parsed.data;
    const email = normalizeEmailAddress(parsed.data.email);
    const normalizedPhone = normalizeKazakhstanPhone(phone);
    const passwordPolicyError = validatePasswordPolicy(password);

    if (!email) {
      return jsonError('Введите корректный email адрес');
    }

    const hasValidEmailDomain = await hasEmailDomainRecords(email);
    if (!hasValidEmailDomain) {
      return jsonError('Укажите рабочий email: домен почты не найден');
    }

    if (!normalizedPhone) {
      return jsonError('Введите корректный мобильный номер Казахстана');
    }

    if (passwordPolicyError) {
      return jsonError(passwordPolicyError);
    }

    await connectDB();

    const exists = await User.findOne({ $or: [{ email }, { phone: normalizedPhone }] });
    if (exists) {
      return jsonError('Пользователь с таким email или телефоном уже существует', 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      password: hashed,
      role: 'user',
    });

    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email }, { status: 201 });
  } catch (err: unknown) {
    console.error('Register error:', err);
    return jsonError('Ошибка сервера', 500);
  }
}
