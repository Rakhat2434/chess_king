'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  parentName: z.string().trim().min(2, 'Введите имя (минимум 2 символа)').max(100),
  studentName: z.string().trim().max(100).optional().or(z.literal('')),
  age: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : Number(value)),
    z.number().min(4, 'Минимальный возраст 4 года').max(99).optional()
  ),
  phone: z.string().trim().regex(/^\+?[0-9\s()-]{10,20}$/, 'Введите корректный номер телефона'),
  branchId: z.string().min(1, 'Выберите филиал'),
  coachId: z.string().optional(),
  preferredTime: z.string().trim().min(3, 'Укажите удобное время').max(120),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  comment: z.string().trim().max(500).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface Branch { _id: string; name: string }
interface Coach { _id: string; name: string; branch: { _id: string; name: string } }

interface Props {
  branches: Branch[];
  coaches: Coach[];
  defaultBranch?: string;
  defaultCoach?: string;
}

const levelLabels = {
  beginner: 'Начинающий (не знаю шахмат)',
  intermediate: 'Средний (играю редко)',
  advanced: 'Продвинутый (участвую в турнирах)',
};

export default function EnrollForm({ branches, coaches, defaultBranch, defaultCoach }: Props) {
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      level: 'beginner',
      branchId: defaultBranch || '',
      coachId: defaultCoach || '',
    },
  });

  const selectedBranch = watch('branchId');
  const selectedCoach = watch('coachId');
  const filteredCoaches = coaches.filter((c) => !selectedBranch || c.branch?._id === selectedBranch);

  useEffect(() => {
    if (selectedCoach && !filteredCoaches.some((coach) => coach._id === selectedCoach)) {
      setValue('coachId', '');
    }
  }, [filteredCoaches, selectedCoach, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, coachId: data.coachId || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Ошибка отправки');
      }
      setSuccess(true);
      reset({ level: 'beginner', branchId: defaultBranch || '', coachId: defaultCoach || '' });
      toast.success('Заявка отправлена! Мы свяжемся с вами.');
    } catch (err: any) {
      toast.error(err.message || 'Не удалось отправить заявку');
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-king-navy mb-3">Заявка принята!</h3>
        <p className="text-king-gray mb-6">Наш администратор свяжется с вами в ближайшее время для подтверждения.</p>
        <button onClick={() => setSuccess(false)} className="btn-outline text-sm py-2.5 px-5">
          Отправить ещё заявку
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Имя родителя / ученика *</label>
          <input {...register('parentName')} className="input" placeholder="Иванов Иван" />
          {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
        </div>
        <div>
          <label className="label">Имя ученика (если другое)</label>
          <input {...register('studentName')} className="input" placeholder="Иванов Вася" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Возраст ученика</label>
          <input {...register('age')} type="number" min={4} max={99} className="input" placeholder="10" />
          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
        </div>
        <div>
          <label className="label">Телефон *</label>
          <input {...register('phone')} className="input" placeholder="+7 (700) 000-00-00" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Филиал *</label>
          <select {...register('branchId')} className="input">
            <option value="">Выберите филиал</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
          {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId.message}</p>}
        </div>
        <div>
          <label className="label">Тренер (необязательно)</label>
          <select {...register('coachId')} className="input">
            <option value="">Любой тренер</option>
            {filteredCoaches.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Удобное время *</label>
        <input {...register('preferredTime')} className="input" placeholder="Например: будни 17:00–19:00 или выходные" />
        {errors.preferredTime && <p className="text-red-500 text-xs mt-1">{errors.preferredTime.message}</p>}
      </div>

      <div>
        <label className="label">Уровень игры *</label>
        <div className="grid gap-2">
          {(Object.entries(levelLabels) as [keyof typeof levelLabels, string][]).map(([value, label]) => (
            <label key={value} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 cursor-pointer hover:border-king-blue transition-colors has-[:checked]:border-king-blue has-[:checked]:bg-blue-50">
              <input
                {...register('level')}
                type="radio"
                value={value}
                className="mt-0.5 accent-king-blue"
              />
              <span className="text-sm text-king-navy">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Комментарий (необязательно)</label>
        <textarea {...register('comment')} rows={3} className="input resize-none" placeholder="Любые пожелания или вопросы..." maxLength={500} />
      </div>

      <button type="submit" disabled={isSubmitting || branches.length === 0} className="btn-gold w-full py-3.5 text-base">
        {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
      </button>
    </form>
  );
}
