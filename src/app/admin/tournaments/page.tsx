'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Upload, X, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LocalizedDate from '@/components/i18n/LocalizedDate';

interface Branch { _id: string; name: string }
interface TournamentPrize { place: number; name: string; photo?: string }
interface Tournament {
  _id: string; title: string; description: string; status: string; startDate: string;
  endDate?: string; isPublished: boolean; coverImage?: string; gallery?: string[];
  branch?: { _id: string; name: string } | string;
  location?: string;
  prizes?: TournamentPrize[];
}

interface FormState {
  title: string; description: string; startDate: string; endDate: string;
  branch: string; location: string; status: string; isPublished: boolean;
  coverImage: string;
  prizes: { place: number; name: string; photo: string }[];
}

const empty: FormState = {
  title: '', description: '', startDate: '', endDate: '', branch: '',
  location: '', status: 'upcoming', isPublished: false, coverImage: '',
  prizes: [{ place: 1, name: '', photo: '' }, { place: 2, name: '', photo: '' }, { place: 3, name: '', photo: '' }],
};

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
};

export default function AdminTournamentsPage() {
  const { t, message } = useTranslation();
  const [items, setItems] = useState<Tournament[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        fetch('/api/admin/tournaments'),
        fetch('/api/admin/branches'),
      ]);
      const tData = await tRes.json();
      const bData = await bRes.json();
      setItems(tData.items || []);
      setBranches(bData || []);
    } catch { toast.error(t('common.loadingError')); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toDateInput = (value?: string) => value ? new Date(value).toISOString().slice(0, 10) : '';
  const getBranchId = (branch?: Tournament['branch']) => typeof branch === 'string' ? branch : branch?._id || '';

  const openCreate = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (item: Tournament) => {
    setEditing(item);
    setForm({
      ...empty,
      title: item.title,
      description: item.description || '',
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      branch: getBranchId(item.branch),
      location: item.location || '',
      status: item.status,
      isPublished: item.isPublished,
      coverImage: item.coverImage || '',
      prizes: item.prizes?.length
        ? empty.prizes.map((p) => {
            const prize = item.prizes?.find((candidate) => candidate.place === p.place);
            return { ...p, name: prize?.name || '', photo: prize?.photo || '' };
          })
        : empty.prizes,
    });
    setModal(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'chessking/tournaments');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm(f => ({ ...f, coverImage: data.url }));
      toast.success(t('admin.photoUploaded'));
    } catch { toast.error(t('admin.photoUploadError')); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.branch) {
      toast.error(t('common.fillRequired')); return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      toast.error(t('admin.endDateBeforeStart')); return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/tournaments/${editing._id}` : '/api/admin/tournaments';
      const method = editing ? 'PUT' : 'POST';
      const prizes = form.prizes.filter(p => p.name.trim());
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, prizes }),
      });
      if (!res.ok) throw new Error((await res.json()).error || t('common.saveError'));
      toast.success(editing ? t('admin.tournamentUpdated') : t('admin.tournamentCreated'));
      setModal(false);
      fetchAll();
    } catch (err: any) { toast.error(message(err.message)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/tournaments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || t('common.deleteError'));
      toast.success(t('admin.tournamentDeleted'));
      setItems(items.filter(i => i._id !== id));
    } catch (err) { toast.error(err instanceof Error ? message(err.message) : t('common.deleteError')); }
    finally { setDeleteConfirm(null); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-king-navy">{t('admin.tournaments')}</h1>
          <p className="text-king-gray text-sm mt-1">{t('admin.tournamentsCount', { count: items.length })}</p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2.5 px-5 text-sm">
          <Plus className="w-4 h-4" />
          {t('admin.addTournament')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-king-gray">
            <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p>{t('admin.noTournaments')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">{t('common.title')}</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold hidden md:table-cell">{t('common.date')}</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold hidden lg:table-cell">{t('common.branch')}</th>
                  <th className="text-left px-5 py-3.5 text-king-gray font-semibold">{t('common.status')}</th>
                  <th className="text-right px-5 py-3.5 text-king-gray font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-king-navy">{item.title}</td>
                    <td className="px-5 py-3 text-king-gray hidden md:table-cell"><LocalizedDate value={item.startDate} format="short" /></td>
                    <td className="px-5 py-3 text-king-gray hidden lg:table-cell">
                      {typeof item.branch === 'string' ? '—' : item.branch?.name || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                        {t(`tournaments.status${item.status[0].toUpperCase()}${item.status.slice(1)}`)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="p-2 hover:bg-blue-50 rounded-lg text-king-blue transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(item._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
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
            <h3 className="font-display text-lg font-bold text-king-navy mb-2">{t('admin.deleteTournamentTitle')}</h3>
            <p className="text-king-gray text-sm mb-5">{t('admin.deleteTournamentText')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1 py-2.5 text-sm">{t('common.cancel')}</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">{t('common.delete')}</button>
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
                {editing ? t('admin.editTournament') : t('admin.newTournament')}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Cover */}
              <div>
                <label className="label">{t('admin.cover')}</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                {form.coverImage ? (
                  <div className="relative h-36 rounded-xl overflow-hidden">
                    <Image src={form.coverImage} alt="Cover" fill className="object-cover" />
                    <button onClick={() => setForm(f => ({ ...f, coverImage: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-king-blue hover:text-king-blue transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    {uploading ? t('common.uploading') : t('admin.uploadCover')}
                  </button>
                )}
              </div>

              <div>
                <label className="label">{t('admin.tournamentTitleRequired')}</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="input" placeholder={t('admin.tournamentTitlePlaceholder')} />
              </div>
              <div>
                <label className="label">{t('admin.tournamentDescriptionRequired')}</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={4} className="input resize-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('admin.startDate')}</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} className="input" />
                </div>
                <div>
                  <label className="label">{t('admin.endDate')}</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} className="input" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('enrollForm.branch')}</label>
                  <select value={form.branch} onChange={e => setForm(f => ({...f, branch: e.target.value}))} className="input">
                    <option value="">{t('admin.selectBranch')}</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('common.status')}</label>
                  <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="input">
                    <option value="upcoming">{t('tournaments.statusUpcoming')}</option>
                    <option value="ongoing">{t('tournaments.statusOngoing')}</option>
                    <option value="completed">{t('tournaments.statusCompleted')}</option>
                  </select>
                </div>
              </div>

              {/* Prizes (for completed) */}
              {form.status === 'completed' && (
                <div>
                  <label className="label">{t('admin.prizeWinners')}</label>
                  <div className="space-y-2">
                    {form.prizes.map((prize, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-lg w-6 text-center">{['🥇','🥈','🥉'][i]}</span>
                        <input
                          value={prize.name}
                          onChange={e => {
                            const prizes = [...form.prizes];
                            prizes[i] = { ...prizes[i], name: e.target.value };
                            setForm(f => ({ ...f, prizes }));
                          }}
                          className="input flex-1"
                          placeholder={t('admin.prizePlaceholder', { place: i + 1 })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPublished}
                  onChange={e => setForm(f => ({...f, isPublished: e.target.checked}))}
                  className="w-4 h-4 accent-king-blue" />
                <span className="text-sm font-medium text-king-navy">{t('admin.publish')}</span>
              </label>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="btn-outline flex-1 py-2.5 text-sm">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? t('common.saving') : editing ? t('common.save') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
