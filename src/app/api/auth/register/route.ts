import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getErrorMessage, jsonError } from '@/lib/api';
import { isHoneypotFilled, rateLimit, validatePasswordPolicy } from '@/lib/security';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  password: z.string().min(1).max(128),
  website: z.string().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, {
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
    const email = parsed.data.email.toLowerCase();
    const passwordPolicyError = validatePasswordPolicy(password);

    if (passwordPolicyError) {
      return jsonError(passwordPolicyError);
    }

    await connectDB();

    const exists = await User.findOne({ email });
    if (exists) {
      return jsonError('Пользователь с таким email уже существует', 409);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone: phone || undefined,
      password: hashed,
      role: 'user',
    });

    return NextResponse.json({ id: user._id.toString(), name: user.name, email: user.email }, { status: 201 });
  } catch (err: unknown) {
    console.error('Register error:', err);
    return jsonError(getErrorMessage(err), 500);
  }
}
