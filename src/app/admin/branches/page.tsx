'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, MapPin, X, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Branch {
  _id: string; name: string; address: string; city: string;
  phone: string; schedule: string; isActive: boolean;
  whatsapp?: string; mapEmbed?: string; mapUrl?: string; image?: string;
}

const empty = { name: '', address: '', city: 'Астана', phone: '', whatsapp: '', schedule: '', mapEmbed: '', mapUrl: '', image: '', isActive: true };

export default function AdminBranchesPage() {
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/branches');
      setItems(await res.json());
    } catch { toast.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => { setEditing(null); setForm({ ...empty }); setModal(true); };
  const openEdit = (item: Branch) => { setEditing(item); setForm({ ...empty, ...item }); setModal(true); };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'chessking/branches');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка загрузки');
      const data = await res.json();
      setForm((f: any) => ({ ...f, image: data.url }));
      toast.success('Фото загружено');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.address || !form.phone || !form.schedule) {
      toast.error('Заполните обязательные поля'); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/branches/${editing._id}` : '/api/admin/branches';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Обновлено' : 'Создано');
      setModal(false);
      fetchItems();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка удаления');
      toast.success('Удалено');
      setItems(items.filter(i => i._id !== id));
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка'); }
    finally { setDeleteConfirm(null); }
  };

  const f = (key: string) => (e: any) => setForm((p: any) => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-king-navy">Филиалы</h1>
          <p className="text-king-gray text-sm mt-1">{items.length} филиалов</p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2.5 px-5 text-sm">
          <Plus className="w-4 h-4" /> Добавить филиал
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? <div className="p-8 space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        : items.length === 0 ? (
          <div className="text-center py-16 text-king-gray">
            <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>Филиалов нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">Название</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold hidden md:table-cell">Адрес</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold hidden lg:table-cell">Телефон</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">Статус</th>
                  <th className="text-right px-5 py-3.5 text-king-gray font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-king-navy">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-royal-100">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={48} height={40} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-royal-300">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <span className="min-w-0">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-king-gray hidden md:table-cell">{item.address}</td>
                    <td className="px-5 py-3 text-king-gray hidden lg:table-cell">{item.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-king-blue transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(item._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">Удалить филиал?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">Отмена</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-king-navy">{editing ? 'Редактировать филиал' : 'Новый филиал'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              <div>
                <label className="label">Фото филиала</label>
                <div className="mt-2 flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center">
                  <div className="relative h-28 w-full overflow-hidden rounded-xl bg-royal-100 sm:w-44">
                    {form.image ? (
                      <Image src={form.image} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-royal-300">
                        <ImageIcon className="h-9 w-9" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="btn-outline px-4 py-2 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </button>
                    {form.image && (
                      <button
                        type="button"
                        onClick={() => setForm((f: any) => ({ ...f, image: '' }))}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                      >
                        Удалить фото
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Название *</label>
                  <input value={form.name} onChange={f('name')} className="input" placeholder="Филиал №1 — Есиль" />
                </div>
                <div className="col-span-2">
                  <label className="label">Адрес *</label>
                  <input value={form.address} onChange={f('address')} className="input" placeholder="ул. Сауран, 24" />
                </div>
                <div>
                  <label className="label">Город</label>
                  <input value={form.city} onChange={f('city')} className="input" placeholder="Астана" />
                </div>
                <div>
                  <label className="label">Телефон *</label>
                  <input value={form.phone} onChange={f('phone')} className="input" placeholder="+7 775 509 2977" />
                </div>
                <div className="col-span-2">
                  <label className="label">Расписание *</label>
                  <input value={form.schedule} onChange={f('schedule')} className="input" placeholder="Пн–Пт 15:00–20:00, Сб 10:00–16:00" />
                </div>
                <div className="col-span-2">
                  <label className="label">Google Maps Embed URL</label>
                  <input value={form.mapEmbed} onChange={f('mapEmbed')} className="input" placeholder="https://maps.google.com/maps?..." />
                  <p className="text-xs text-gray-400 mt-1">Google Maps → Поделиться → Встроить карту → URL из src=&quot;...&quot;</p>
                </div>
                <div className="col-span-2">
                  <label className="label">Ссылка на карту</label>
                  <input value={form.mapUrl} onChange={f('mapUrl')} className="input" placeholder="https://goo.gl/maps/..." />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="w-4 h-4 accent-king-blue" />
                <span className="text-sm font-medium text-king-navy">Филиал активен</span>
              </label>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="btn-outline flex-1 py-2.5 text-sm">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">{saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
