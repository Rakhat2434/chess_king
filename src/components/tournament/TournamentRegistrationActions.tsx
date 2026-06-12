'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogIn, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getWhatsAppUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';

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

const statusInfo: Record<RegistrationStatus, { labelKey: string; color: string }> = {
  pending: { labelKey: 'tournamentRegistration.statusPending', color: 'bg-yellow-100 text-yellow-700' },
  approved: { labelKey: 'tournamentRegistration.statusApproved', color: 'bg-green-100 text-green-700' },
  rejected: { labelKey: 'tournamentRegistration.statusRejected', color: 'bg-red-100 text-red-700' },
  attended: { labelKey: 'tournamentRegistration.statusAttended', color: 'bg-blue-100 text-blue-700' },
  cancelled: { labelKey: 'tournamentRegistration.statusCancelled', color: 'bg-gray-100 text-gray-600' },
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
  const { t, message } = useTranslation();
  const [status, setStatus] = useState<RegistrationStatus | null>(initialStatus || null);
  const [loading, setLoading] = useState(false);

  const whatsappMessage = t('whatsappMessages.tournament', {
    title,
    date: dateLabel,
    branch: branchLabel || t('common.notSpecified'),
  });

  const submitRegistration = async () => {
    if (!isAuthenticated) {
      toast.error(t('tournamentRegistration.loginRequired'));
      return;
    }

    if (isClosed) {
      toast.error(t('tournamentRegistration.closed'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('tournamentRegistration.sendError'));

      setStatus(data.status);
      toast.success(data.alreadyExists ? t('tournamentRegistration.alreadyExists') : t('tournamentRegistration.success'));
    } catch (err) {
      toast.error(err instanceof Error ? message(err.message) : t('tournamentRegistration.sendError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-5 mb-10 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-king-navy">{t('tournamentRegistration.title')}</p>
          {status ? (
            <span className={cn('inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold', statusInfo[status].color)}>
              {t(statusInfo[status].labelKey)}
            </span>
          ) : (
            <p className="text-sm text-king-gray mt-1">
              {t('tournamentRegistration.description')}
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
            {loading ? t('common.sending') : status ? t('tournamentRegistration.created') : t('tournamentRegistration.submit')}
          </button>

          {!isAuthenticated && (
            <Link href="/login" className="btn-outline py-2.5 px-5 text-sm inline-flex">
              <LogIn className="w-4 h-4" />
              {t('tournamentRegistration.login')}
            </Link>
          )}

          <a
            href={getWhatsAppUrl(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline py-2.5 px-5 text-sm inline-flex"
          >
            <MessageCircle className="w-4 h-4 text-green-500" />
            {t('tournamentRegistration.writeWhatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
