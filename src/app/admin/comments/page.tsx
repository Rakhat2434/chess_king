'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LocalizedDate from '@/components/i18n/LocalizedDate';
import DynamicText from '@/components/i18n/DynamicText';

interface Comment {
  _id: string; text?: string; content?: string; isVisible: boolean; createdAt: string;
  user?: { name: string; email: string };
  tournament?: { title: string; slug: string };
}

export default function AdminCommentsPage() {
  const { t, message } = useTranslation();
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments');
      const data = await res.json();
      setItems(data.items || []);
    } catch { toast.error(t('common.loadingError')); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible }),
      });
      if (!res.ok) throw new Error((await res.json()).error || t('common.updateError'));
      setItems(items.map(i => i._id === id ? { ...i, isVisible } : i));
      toast.success(isVisible ? t('admin.commentShown') : t('admin.commentHidden'));
    } catch (err) { toast.error(err instanceof Error ? message(err.message) : t('common.genericError')); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || t('common.deleteError'));
      setItems(items.filter(i => i._id !== id));
      toast.success(t('common.deleted'));
    } catch (err) { toast.error(err instanceof Error ? message(err.message) : t('common.genericError')); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-king-navy">{t('admin.comments')}</h1>
        <p className="text-king-gray text-sm mt-1">{t('admin.commentsCount', { count: items.length })}</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card text-center py-16 text-king-gray">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>{t('admin.noComments')}</p>
          </div>
        ) : items.map(item => (
          <div
            key={item._id}
            className={cn(
              'bg-white rounded-2xl shadow-card p-5 transition-opacity',
              !item.isVisible && 'opacity-50'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="font-semibold text-king-navy text-sm">
                    {item.user?.name || t('common.user')}
                  </span>
                  {item.user?.email && (
                    <span className="text-xs text-king-gray">{item.user.email}</span>
                  )}
                  <span className="text-xs text-gray-400"><LocalizedDate value={item.createdAt} /></span>
                  {!item.isVisible && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">{t('common.hidden')}</span>
                  )}
                </div>
                <p className="text-king-navy text-sm leading-relaxed">
                  <DynamicText text={item.content || item.text} cacheKey={`comment-${item._id}`} />
                </p>
                {item.tournament && (
                  <Link
                    href={`/tournaments/${item.tournament.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-king-blue hover:underline mt-2"
                  >
                    <DynamicText text={item.tournament.title} cacheKey={`tournament-title-${item.tournament.slug}`} />
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleVisibility(item._id, !item.isVisible)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    item.isVisible
                      ? 'hover:bg-yellow-50 text-yellow-500'
                      : 'hover:bg-green-50 text-green-500'
                  )}
                  title={item.isVisible ? t('common.hide') : t('common.show')}
                >
                  {item.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDeleteConfirm(item._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">{t('admin.deleteCommentTitle')}</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">{t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
