'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ClipboardCheck, ExternalLink, MailWarning, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LocalizedDate from '@/components/i18n/LocalizedDate';
import DynamicText from '@/components/i18n/DynamicText';

type Status = 'pending' | 'approved' | 'rejected' | 'attended' | 'cancelled';

interface Registration {
  _id: string;
  status: Status;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user?: { name: string; email: string };
  tournament?: {
    title: string;
    slug: string;
    startDate: string;
    branch?: { name: string; city?: string };
  };
  updatedBy?: { name: string };
}

const statusOptions: Array<{ value: Status | ''; labelKey: string; color?: string }> = [
  { value: '', labelKey: 'common.allStatuses' },
  { value: 'pending', labelKey: 'admin.statusPending', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'approved', labelKey: 'admin.statusApproved', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', labelKey: 'admin.statusRejected', color: 'bg-red-100 text-red-700' },
  { value: 'attended', labelKey: 'admin.statusAttended', color: 'bg-blue-100 text-blue-700' },
  { value: 'cancelled', labelKey: 'admin.statusCancelled', color: 'bg-gray-100 text-gray-600' },
];

const quickActions: Array<{ status: Status; labelKey: string; icon: React.ElementType; className: string }> = [
  { status: 'approved', labelKey: 'admin.quickApprove', icon: Check, className: 'text-green-600 hover:bg-green-50' },
  { status: 'rejected', labelKey: 'admin.quickReject', icon: X, className: 'text-red-500 hover:bg-red-50' },
  { status: 'attended', labelKey: 'admin.quickAttended', icon: ClipboardCheck, className: 'text-blue-600 hover:bg-blue-50' },
  { status: 'cancelled', labelKey: 'admin.quickCancel', icon: X, className: 'text-gray-500 hover:bg-gray-50' },
];

export default function AdminTournamentRegistrationsPage() {
  const { t, message } = useTranslation();
  const [items, setItems] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const statusMap = useMemo(() => Object.fromEntries(statusOptions.filter(s => s.value).map(s => [s.value, s])), []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = filterStatus ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/admin/tournament-registrations${q}`);
      const data = await res.json();
      const nextItems = data.items || [];
      setItems(nextItems);
      setNotes(Object.fromEntries(nextItems.map((item: Registration) => [item._id, item.adminNote || ''])));
    } catch {
      toast.error(t('common.loadingError'));
    } finally {
      setLoading(false);
    }
  }, [filterStatus, t]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (id: string, status: Status) => {
    try {
      const res = await fetch(`/api/admin/tournament-registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote: notes[id] || '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('common.updateError'));

      setItems(items.map(item => item._id === id ? data.item : item));
      toast.success(t('admin.registrationStatusUpdated'));
      if (data.emailWarning) toast(message(data.emailWarning), { icon: <MailWarning className="w-4 h-4 text-yellow-500" /> });
    } catch (err) {
      toast.error(err instanceof Error ? message(err.message) : t('common.updateError'));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tournament-registrations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || t('common.deleteError'));
      setItems(items.filter(item => item._id !== id));
      toast.success(t('admin.registrationDeleted'));
    } catch (err) {
      toast.error(err instanceof Error ? message(err.message) : t('common.deleteError'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-king-navy">{t('admin.tournamentRegistrations')}</h1>
          <p className="text-king-gray text-sm mt-1">{t('admin.enrollmentsCount', { count: items.length })}</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-auto text-sm py-2.5"
        >
          {statusOptions.map(option => (
            <option key={option.value || 'all'} value={option.value}>{t(option.labelKey)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card text-center py-16 text-king-gray">
            <ClipboardCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>{t('admin.noTournamentRegistrations')}</p>
          </div>
        ) : items.map(item => {
          const status = statusMap[item.status] || statusMap.pending;
          return (
            <div key={item._id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-semibold text-king-navy">{item.user?.name || t('common.user')}</span>
                    {item.user?.email && <span className="text-xs text-king-gray">{item.user.email}</span>}
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', status.color)}>
                      {t(status.labelKey)}
                    </span>
                  </div>

                  {item.tournament && (
                    <Link
                      href={`/tournaments/${item.tournament.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-king-blue text-sm font-medium hover:underline"
                    >
                      <DynamicText text={item.tournament.title} cacheKey={`tournament-title-${item.tournament.slug}`} />
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  <div className="grid sm:grid-cols-3 gap-2 mt-3 text-sm text-king-gray">
                    <span>{t('common.date')}: {item.tournament?.startDate ? <LocalizedDate value={item.tournament.startDate} format="short" /> : '—'}</span>
                    <span>{t('common.branch')}: {item.tournament?.branch?.name || '—'}</span>
                    <span>{t('admin.submittedAt', { date: '' })} <LocalizedDate value={item.createdAt} /></span>
                  </div>

                  {item.updatedBy && (
                    <p className="text-xs text-gray-400 mt-2">{t('admin.updatedBy', { name: item.updatedBy.name })}</p>
                  )}

                  <textarea
                    value={notes[item._id] || ''}
                    onChange={(e) => setNotes({ ...notes, [item._id]: e.target.value })}
                    className="input resize-none mt-4 text-sm"
                    rows={2}
                    maxLength={500}
                    placeholder={t('admin.adminNotePlaceholder')}
                  />
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {quickActions.map(({ status: nextStatus, labelKey, icon: Icon, className }) => (
                    <button
                      key={nextStatus}
                      type="button"
                      onClick={() => updateStatus(item._id, nextStatus)}
                      className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors', className)}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t(labelKey)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(item._id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">{t('admin.deleteEnrollmentTitle')}</h3>
            <p className="text-sm text-king-gray">{t('admin.deleteTournamentRegistrationText')}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">{t('common.cancel')}</button>
              <button onClick={() => deleteItem(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
