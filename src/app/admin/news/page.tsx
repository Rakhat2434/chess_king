'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Crown } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface NewsItem {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  coverImage?: string;
}

interface FormState {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

const empty: FormState = { title: '', excerpt: '', content: '', coverImage: '', isPublished: false };

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news');
      const data = await res.json();
      setItems(data.items || []);
    } catch { toast.error('Не удалось загрузить новости'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (item: NewsItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      coverImage: item.coverImage || '',
      isPublished: item.isPublished,
    });
    setModal(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'chessking/news');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Ошибка загрузки');
      const data = await res.json();
      setForm(f => ({ ...f, coverImage: data.url }));
      toast.success('Фото загружено');
    } catch { toast.error('Не удалось загрузить фото'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Заполните заголовок и содержимое'); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/news/${editing._id}` : '/api/admin/news';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка сохранения');
      toast.success(editing ? 'Новость обновлена' : 'Новость создана');
      setModal(false);
      fetchItems();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка удаления');
      toast.success('Новость удалена');
      setItems(items.filter(i => i._id !== id));
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка удаления'); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-king-navy">Новости</h1>
          <p className="text-king-gray text-sm mt-1">{items.length} записей</p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2.5 px-5 text-sm">
          <Plus className="w-4 h-4" />
          Добавить новость
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-king-gray">
            <Crown className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>Новостей пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">Фото</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">Заголовок</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold hidden md:table-cell">Дата</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">Статус</th>
                  <th className="text-right px-5 py-3.5 text-king-gray font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {item.coverImage ? (
                          <Image src={item.coverImage} alt="" width={48} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <Crown className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-king-navy line-clamp-1">{item.title}</p>
                      <p className="text-king-gray text-xs line-clamp-1 mt-0.5">{item.excerpt}</p>
                    </td>
                    <td className="px-5 py-3 text-king-gray hidden md:table-cell">
                      {item.publishedAt ? formatDateShort(item.publishedAt) : formatDateShort(item.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.isPublished ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-king-blue transition-colors" title="Редактировать">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(item._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Удалить">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">Удалить новость?</h3>
            <p className="text-king-gray text-sm mb-5">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">Отмена</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-king-navy">
                {editing ? 'Редактировать новость' : 'Новая новость'}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Cover image */}
              <div>
                <label className="label">Обложка</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                {form.coverImage ? (
                  <div className="relative h-40 rounded-xl overflow-hidden mb-2">
                    <Image src={form.coverImage} alt="Cover" fill className="object-cover" />
                    <button
                      onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-king-blue hover:text-king-blue transition-colors text-sm"
                  >
                    <Upload className="w-5 h-5" />
                    {uploading ? 'Загрузка...' : 'Нажмите для загрузки фото'}
                  </button>
                )}
              </div>

              <div>
                <label className="label">Заголовок *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Заголовок новости" />
              </div>
              <div>
                <label className="label">Краткое описание (excerpt)</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className="input resize-none"
                  placeholder="Краткое описание для карточки (до 400 символов)"
                  maxLength={400}
                />
              </div>
              <div>
                <label className="label">Содержимое *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={8}
                  className="input resize-none font-mono text-sm"
                  placeholder="Полный текст новости..."
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-king-blue"
                />
                <span className="text-sm font-medium text-king-navy">Опубликовать сразу</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="btn-outline flex-1 py-2.5 text-sm">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
