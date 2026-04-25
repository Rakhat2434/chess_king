'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Send, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Comment {
  _id: string;
  text: string;
  user: { name: string };
  createdAt: string;
}

interface Props {
  tournamentId: string;
  initialComments: Comment[];
  session: { id: string; name: string } | null;
}

export default function TournamentComments({ tournamentId, initialComments, session }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);

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
        throw new Error(err.error || 'Ошибка');
      }
      const newComment = await res.json();
      if (newComment?.skipped) {
        setText('');
        setWebsite('');
        toast.success('Комментарий добавлен');
        return;
      }
      setComments([newComment, ...comments]);
      setText('');
      setWebsite('');
      toast.success('Комментарий добавлен');
    } catch (err: any) {
      toast.error(err.message || 'Не удалось добавить комментарий');
    } finally {
      setLoading(false);
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
              Комментируете как <span className="font-semibold text-king-navy">{session.name}</span>
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ваш комментарий..."
              rows={3}
              maxLength={1000}
              className="input resize-none bg-white"
              required
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">{text.length}/1000</span>
              <button type="submit" disabled={loading || !text.trim()} className="btn-primary py-2.5 px-5 text-sm">
                <Send className="w-4 h-4" />
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 text-center">
          <MessageSquare className="w-8 h-8 text-blue-300 mx-auto mb-2" />
          <p className="text-king-navy font-medium mb-3">Войдите, чтобы оставить комментарий</p>
          <Link href="/login" className="btn-primary py-2.5 px-5 text-sm inline-flex">
            <LogIn className="w-4 h-4" />
            Войти
          </Link>
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-10 text-king-gray">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p>Комментариев пока нет. Будьте первым!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-royal-100 rounded-full flex items-center justify-center text-king-blue font-bold text-sm">
                    {c.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="font-semibold text-king-navy text-sm">{c.user?.name || 'Пользователь'}</span>
                </div>
                <span className="text-xs text-king-gray">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-king-navy text-sm leading-relaxed pl-10">{c.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
