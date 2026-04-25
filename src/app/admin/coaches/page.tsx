'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Branch { _id: string; name: string }
interface Coach {
  _id: string; name: string; title: string; experience: number;
  photo?: string; isActive: boolean; branch?: { name: string };
}

const empty: any = {
  name: '', title: '', bio: '', experience: 0, branch: '',
  achievements: '', specialization: '', photo: '', order: 0, isActive: true,
};

export default function AdminCoachesPage() {
  const [items, setItems] = useState<Coach[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Coach | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, bRes] = await Promise.all([fetch('/api/admin/coaches'), fetch('/api/admin/branches')]);
      setItems(await cRes.json());
      setBranches(await bRes.json());
    } catch { toast.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      ...empty, ...item,
      branch: item.branch?._id || item.branch || '',
      achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : '',
      specialization: Array.isArray(item.specialization) ? item.specialization.join(', ') : '',
    });
    setModal(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('folder', 'chessking/coaches');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm((f: any) => ({ ...f, photo: data.url }));
      toast.success('Фото загружено');
    } catch { toast.error('Ошибка загрузки'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.title || !form.bio || !form.branch) {
      toast.error('Заполните обязательные поля'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        experience: parseInt(form.experience) || 0,
        achievements: form.achievements ? form.achievements.split('\n').filter(Boolean) : [],
        specialization: form.specialization ? form.specialization.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      };
      const url = editing ? `/api/admin/coaches/${(editing as any)._id}` : '/api/admin/coaches';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? 'Обновлено' : 'Создано');
      setModal(false);
      fetchAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coaches/${id}`, { method: 'DELETE' });
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
          <h1 className="font-display text-2xl font-bold text-king-navy">Тренеры</h1>
          <p className="text-king-gray text-sm mt-1">{items.length} тренеров</p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2.5 px-5 text-sm">
          <Plus className="w-4 h-4" /> Добавить тренера
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? [1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)
        : items.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-king-gray bg-white rounded-2xl shadow-card">
            <User className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>Тренеров нет</p>
          </div>
        ) : items.map(item => (
          <div key={item._id} className="bg-white rounded-2xl shadow-card p-5 flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-royal-100 overflow-hidden flex-shrink-0">
              {item.photo ? (
                <Image src={item.photo} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display text-lg font-bold text-royal-400">
                  {item.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-king-navy text-sm">{item.name}</p>
              <p className="text-king-gold text-xs">{item.title}</p>
              <p className="text-king-gray text-xs mt-0.5">{item.branch?.name}</p>
              <p className="text-king-gray text-xs">{item.experience} лет опыта</p>
            </div>
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded-lg text-king-blue transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDeleteConfirm(item._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">Удалить тренера?</h3>
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
              <h2 className="font-display text-xl font-bold text-king-navy">{editing ? 'Редактировать тренера' : 'Новый тренер'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-royal-100 overflow-hidden flex-shrink-0">
                  {form.photo ? (
                    <Image src={form.photo} alt="" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-royal-300"><User className="w-8 h-8" /></div>
                  )}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="btn-outline text-sm py-2 px-4">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Загрузка...' : 'Загрузить фото'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Имя *</label><input value={form.name} onChange={f('name')} className="input" /></div>
                <div><label className="label">Звание/должность *</label><input value={form.title} onChange={f('title')} className="input" placeholder="Международный мастер" /></div>
                <div><label className="label">Опыт (лет) *</label><input type="number" min={0} value={form.experience} onChange={f('experience')} className="input" /></div>
                <div className="col-span-2"><label className="label">Биография *</label><textarea value={form.bio} onChange={f('bio')} rows={4} className="input resize-none" /></div>
                <div className="col-span-2">
                  <label className="label">Достижения (каждое с новой строки)</label>
                  <textarea value={form.achievements} onChange={f('achievements')} rows={3} className="input resize-none text-sm" placeholder="1-й чемпионат Казахстана 2020&#10;Мастер ФИДЕ 2018" />
                </div>
                <div className="col-span-2">
                  <label className="label">Специализация (через запятую)</label>
                  <input value={form.specialization} onChange={f('specialization')} className="input" placeholder="Дети, Эндшпиль, Дебют" />
                </div>
                <div>
                  <label className="label">Филиал *</label>
                  <select value={form.branch} onChange={f('branch')} className="input">
                    <option value="">Выберите</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div><label className="label">Порядок</label><input type="number" value={form.order} onChange={f('order')} className="input" /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="w-4 h-4 accent-king-blue" />
                <span className="text-sm font-medium text-king-navy">Активен</span>
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
