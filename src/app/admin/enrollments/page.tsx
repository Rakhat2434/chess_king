'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Trash2, ChevronDown } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Enrollment {
  _id: string; parentName: string; studentName?: string; phone: string;
  age?: number; preferredTime: string; level: string; comment?: string;
  status: string; createdAt: string;
  branch?: { name: string }; coach?: { name: string };
}

const statusOptions = [
  { value: 'new', label: 'Новая', color: 'bg-blue-100 text-blue-700' },
  { value: 'processing', label: 'В обработке', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Подтверждена', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Отменена', color: 'bg-red-100 text-red-700' },
];

const levelLabels: Record<string, string> = {
  beginner: 'Начинающий', intermediate: 'Средний', advanced: 'Продвинутый',
};

export default function AdminEnrollmentsPage() {
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = filterStatus ? `?status=${filterStatus}` : '';
      const res = await fetch(`/api/enrollments${q}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { toast.error('Ошибка загрузки'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка обновления');
      setItems(items.map(i => i._id === id ? { ...i, status } : i));
      toast.success('Статус обновлён');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/enrollments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Ошибка удаления');
      setItems(items.filter(i => i._id !== id));
      toast.success('Удалено');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка'); }
    finally { setDeleteConfirm(null); }
  };

  const getStatusInfo = (s: string) => statusOptions.find(o => o.value === s) || statusOptions[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-king-navy">Заявки на обучение</h1>
          <p className="text-king-gray text-sm mt-1">{items.length} заявок</p>
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input w-auto text-sm py-2.5"
        >
          <option value="">Все статусы</option>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card text-center py-16 text-king-gray">
            <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>Заявок нет</p>
          </div>
        ) : items.map(item => {
          const st = getStatusInfo(item.status);
          return (
            <div key={item._id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display font-semibold text-king-navy">{item.parentName}</h3>
                    {item.studentName && (
                      <span className="text-sm text-king-gray">→ {item.studentName}</span>
                    )}
                    {item.age && <span className="text-xs text-king-gray bg-gray-100 px-2 py-0.5 rounded-full">{item.age} лет</span>}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-sm text-king-gray">
                    <span>📞 {item.phone}</span>
                    {item.branch && <span>🏢 {item.branch.name}</span>}
                    <span>🕐 {item.preferredTime}</span>
                    <span>📊 {levelLabels[item.level] || item.level}</span>
                  </div>
                  {item.coach && <p className="text-xs text-king-gray mt-1">Тренер: {item.coach.name}</p>}
                  {item.comment && <p className="text-xs text-king-gray mt-1 italic">&quot;{item.comment}&quot;</p>}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(item.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <select
                      value={item.status}
                      onChange={e => updateStatus(item._id, e.target.value)}
                      className={cn('pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold appearance-none cursor-pointer border-0 outline-none', st.color)}
                    >
                      {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(item._id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">Удалить заявку?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">Отмена</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
