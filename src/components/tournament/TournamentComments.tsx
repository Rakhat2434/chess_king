'use client';

import { useState } from 'react';
import { MessageSquare, Send, LogIn, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LocalizedDate from '@/components/i18n/LocalizedDate';
import DynamicText from '@/components/i18n/DynamicText';

interface Comment {
  _id: string;
  text: string;
  content?: string;
  user: { _id?: string; name: string };
  createdAt: string;
}

interface Props {
  tournamentId: string;
  initialComments: Comment[];
  session: { id: string; name: string; role: 'user' | 'admin' } | null;
}

export default function TournamentComments({ tournamentId, initialComments, session }: Props) {
  const { t, message } = useTranslation();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), website }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t('common.genericError'));
      }
      const newComment = await res.json();
      if (newComment?.skipped) {
        setText('');
        setWebsite('');
        toast.success(t('tournamentComments.addSuccess'));
        return;
      }
      setComments([newComment, ...comments]);
      setText('');
      setWebsite('');
      toast.success(t('tournamentComments.addSuccess'));
    } catch (err: any) {
      toast.error(message(err.message || t('tournamentComments.addFail')));
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t('common.deleteError'));
      }
      setComments(comments.filter(comment => comment._id !== commentId));
      toast.success(t('tournamentComments.deleteSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? message(err.message) : t('tournamentComments.deleteFail'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      {/* Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-gray-50 rounded-2xl p-5">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <p className="text-sm text-king-gray mb-3">
              {t('tournamentComments.as', { name: session.name })}
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('tournamentComments.placeholder')}
              rows={3}
              maxLength={1000}
              className="input resize-none bg-white"
              required
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{text.length}/1000</span>
              <button type="submit" disabled={loading || !text.trim()} className="btn-primary py-2.5 px-5 text-sm">
                <Send className="w-4 h-4" />
                {loading ? t('common.sending') : t('tournamentComments.submit')}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <MessageSquare className="w-8 h-8 text-blue-300 mx-auto mb-2" />
          <p className="text-king-navy font-medium mb-3">{t('tournamentComments.loginPrompt')}</p>
          <Link href="/login" className="btn-primary py-2.5 px-5 text-sm inline-flex">
            <LogIn className="w-4 h-4" />
            {t('nav.login')}
          </Link>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-10 text-king-gray">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p>{t('tournamentComments.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const canDelete = Boolean(session && (session.role === 'admin' || c.user?._id === session.id));
            return (
            <div key={c._id} className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-royal-100 rounded-full flex items-center justify-center text-king-blue font-bold text-sm">
                    {c.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-semibold text-king-navy text-sm">{c.user?.name || t('common.user')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-king-gray"><LocalizedDate value={c.createdAt} /></span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(c._id)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                      title={t('tournamentComments.deleteTooltip')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-king-navy text-sm leading-relaxed pl-10">
                <DynamicText text={c.content || c.text} cacheKey={`comment-${c._id}`} />
              </p>
            </div>
          );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">{t('tournamentComments.deleteTitle')}</h3>
            <p className="text-sm text-king-gray">{t('tournamentComments.deleteText')}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">{t('common.cancel')}</button>
              <button onClick={() => deleteComment(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
