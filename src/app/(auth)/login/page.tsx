'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/components/providers/LanguageProvider';

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { t, message } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('auth.validationEmail')),
        password: z.string().min(1, t('auth.validationPassword')),
      }),
    [t]
  );
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      toast.error(result.error === 'CredentialsSignin' ? t('auth.invalidCredentials') : message(result.error));
      return;
    }
    toast.success(t('auth.loginSuccess'));
    const callbackUrl = searchParams.get('callbackUrl');
    router.push(callbackUrl?.startsWith('/') ? callbackUrl : '/dashboard');
    router.refresh();
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-king-navy mb-1">{t('auth.loginTitle')}</h1>
      <p className="text-king-gray text-sm mb-8">
        {t('auth.noAccount')}{' '}
        <Link href="/register" className="text-king-blue font-medium hover:underline">
          {t('auth.registerLink')}
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input {...register('email')} type="email" className="input" placeholder="example@mail.com" autoComplete="email" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              className="input pr-12"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 mt-2">
          <LogIn className="w-5 h-5" />
          {isSubmitting ? t('auth.loginLoading') : t('auth.loginButton')}
        </button>
      </form>
    </>
  );
}
