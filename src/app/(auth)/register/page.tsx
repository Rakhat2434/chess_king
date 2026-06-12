'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { isValidEmailAddress, isValidKazakhstanPhone } from '@/lib/validators';
import { useTranslation } from '@/components/providers/LanguageProvider';

type FormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  website?: string;
};

export default function RegisterPage() {
  const { t, message } = useTranslation();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t('auth.validationName')).max(100),
          email: z.string().trim().refine(isValidEmailAddress, t('auth.validationWorkEmail')),
          phone: z.string().trim().refine(isValidKazakhstanPhone, t('auth.validationPhone')),
          password: z
            .string()
            .min(8, t('auth.validationPasswordMin'))
            .regex(/[A-Za-zА-Яа-яЁё]/, t('auth.validationPasswordLetter'))
            .regex(/\d/, t('auth.validationPasswordDigit'))
            .max(128, t('auth.validationPasswordLong')),
          confirm: z.string(),
          website: z.string().optional(),
        })
        .refine((d) => d.password === d.confirm, {
          message: t('auth.validationPasswordsMatch'),
          path: ['confirm'],
        }),
    [t]
  );
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          website: data.website,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t('auth.registerError'));
      }
      const signInResult = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (signInResult?.error) throw new Error(t('auth.autoLoginFailed'));
      toast.success(t('auth.accountCreated'));
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(message(err.message));
    }
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-king-navy mb-1">{t('auth.registerTitle')}</h1>
      <p className="text-king-gray text-sm mb-8">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="text-king-blue font-medium hover:underline">
          {t('auth.loginButton')}
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register('website')}
          type="text"
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <div>
          <label className="label">{t('auth.name')}</label>
          <input {...register('name')} className="input" placeholder={t('auth.namePlaceholder')} autoComplete="name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">{t('auth.email')} *</label>
          <input {...register('email')} type="email" className="input" placeholder="example@mail.com" autoComplete="email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">{t('auth.phone')}</label>
          <input {...register('phone')} className="input" placeholder="+7 (700) 000-00-00" autoComplete="tel" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">{t('auth.passwordLabel')}</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              className="input pr-12"
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">{t('auth.confirmPassword')}</label>
          <input {...register('confirm')} type={showPass ? 'text' : 'password'} className="input" placeholder="••••••••" autoComplete="new-password" />
          {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-gold w-full py-3.5 mt-2">
          <UserPlus className="w-5 h-5" />
          {isSubmitting ? t('auth.creating') : t('auth.createAccount')}
        </button>
      </form>
    </>
  );
}
