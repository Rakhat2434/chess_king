'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'attended' | 'cancelled';

interface Props {
  tournamentId: string;
  title: string;
  dateLabel: string;
  branchLabel: string;
  isAuthenticated: boolean;
  isClosed: boolean;
  initialStatus?: RegistrationStatus | null;
}

const statusInfo: Record<RegistrationStatus, { label: string; color: string }> = {
  pending: { label: 'Заявка отправлена', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Участие подтверждено', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Отклонено', color: 'bg-red-100 text-red-700' },
  attended: { label: 'Вы участвовали', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Отменено', color: 'bg-gray-100 text-gray-600' },
};

export default function TournamentRegistrationActions({
  tournamentId,
  title,
  dateLabel,
  branchLabel,
  isAuthenticated,
  isClosed,
  initialStatus,
}: Props) {
  const [status, setStatus] = useState<RegistrationStatus | null>(initialStatus || null);
  const [loading, setLoading] = useState(false);

  const whatsappMessage = `Здравствуйте! Хочу зарегистрироваться на турнир: ${title}. Дата: ${dateLabel}. Филиал: ${branchLabel}.`;

  const submitRegistration = async () => {
    if (!isAuthenticated) {
      toast.error('Войдите, чтобы подать заявку на турнир');
      return;
    }

    if (isClosed) {
      toast.error('Регистрация на завершенный турнир закрыта');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Не удалось отправить заявку');

      setStatus(data.status);
      toast.success(data.alreadyExists ? 'Заявка уже есть' : 'Заявка на турнир отправлена');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка отправки заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-5 mb-10 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-king-navy">Участие в турнире</p>
          {status ? (
            <span className={cn('inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold', statusInfo[status].color)}>
              {statusInfo[status].label}
            </span>
          ) : (
            <p className="text-sm text-king-gray mt-1">
              Подайте заявку на сайте или напишите нам в WhatsApp.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={submitRegistration}
            disabled={loading || isClosed || Boolean(status)}
            className="btn-primary py-2.5 px-5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Отправка...' : status ? 'Заявка создана' : 'Подать заявку на сайте'}
          </button>

          {!isAuthenticated && (
            <Link href="/login" className="btn-outline py-2.5 px-5 text-sm inline-flex">
              <LogIn className="w-4 h-4" />
              Войти
            </Link>
          )}

          <a
            href={getWhatsAppUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline py-2.5 px-5 text-sm inline-flex"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            Написать в WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
