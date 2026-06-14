import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Pencil, Trash2, X, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobPlans, createJobPlan, updateJobPlan, deleteJobPlan, createJobOrder,
} from '../../services/crmService';
import type { JobPlan } from '../../types';

const RANKS = ['Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer', 'Electrician', 'Fitter'];
const EMPTY: Partial<JobPlan> = { title: '', code: '', interval: 90, estimatedDuration: 0, responsibleRank: '', lastDone: '', nextDue: '' };

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";

function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-6 flex flex-col gap-4">{children}</div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader size={13} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>{children}</div>;
}

export function JobPlansPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<JobPlan>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { data: jobPlans, loading, error, reload } = useCrmFetch(
    () => fetchJobPlans(currentVesselId), [currentVesselId]
  );

  const filtered = jobPlans.filter(jp =>
    !search ||
    jp.title.toLowerCase().includes(search.toLowerCase()) ||
    jp.code.toLowerCase().includes(search.toLowerCase()) ||
    jp.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setForm(EMPTY); setEditId(null); setModalOpen(true); }
  function openEdit(jp: JobPlan) {
    setForm({ title: jp.title, code: jp.code, interval: jp.interval, estimatedDuration: jp.estimatedDuration, responsibleRank: jp.responsibleRank, lastDone: jp.lastDone, nextDue: jp.nextDue });
    setEditId(jp.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) await updateJobPlan(editId, form);
      else await createJobPlan(form, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModalOpen(false); reload();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteJobPlan(deleteId); setDeleteId(null); reload(); }
    finally { setDeleting(false); }
  }

  async function generateJO(jp: JobPlan) {
    setGeneratingFor(jp.id);
    try {
      await createJobOrder(
        { title: jp.title, assignedTo: jp.responsibleRank, priority: 'Medium', status: 'Not Started', dueDate: jp.nextDue, linkedPlanId: jp.id },
        currentVesselId !== '__all__' ? currentVesselId : undefined
      );
      showToast(`Job Order created from "${jp.title}"`);
    } finally { setGeneratingFor(null); }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const set = (k: keyof JobPlan) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === 'interval' || k === 'estimatedDuration' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="p-6 min-h-full w-full">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>
      )}

      {modalOpen && (
        <Modal title={editId ? 'Edit Job Plan' : 'Add Job Plan'} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan Code">
              <input className={inp} value={form.code ?? ''} onChange={set('code')} placeholder="JP-ME-001" />
            </Field>
            <Field label="Frequency (days) *">
              <input className={inp} type="number" min={1} value={form.interval ?? 90} onChange={set('interval')} />
            </Field>
          </div>
          <Field label="Plan Title *">
            <input className={inp} value={form.title ?? ''} onChange={set('title')} placeholder="e.g. Main Engine – Annual Overhaul" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Responsible Rank">
              <select className={inp} value={form.responsibleRank ?? ''} onChange={set('responsibleRank')}>
                <option value="">Select rank</option>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Est. Hours">
              <input className={inp} type="number" min={0} value={form.estimatedDuration ?? 0} onChange={set('estimatedDuration')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Last Done">
              <input className={inp} type="date" value={form.lastDone ?? ''} onChange={set('lastDone')} />
            </Field>
            <Field label="Next Due">
              <input className={inp} type="date" value={form.nextDue ?? ''} onChange={set('nextDue')} />
            </Field>
          </div>
        </Modal>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete Job Plan?</p>
            <p className="text-xs text-slate-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader size={12} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Loading…' : `${jobPlans.length} maintenance plans`}</p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary" onClick={openCreate}><Plus size={16} />Add Job Plan</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search plans..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr><th>Plan Code</th><th>Title</th><th>Equipment</th><th>Freq (days)</th><th>Last Done</th><th>Next Due</th><th>Est. Hrs</th><th>Rank</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(jp => (
                <tr key={jp.id}>
                  <td className="text-xs font-mono text-slate-600">{jp.code || '—'}</td>
                  <td className="text-xs font-medium text-slate-800 max-w-xs">{jp.title}</td>
                  <td className="text-xs text-slate-600 max-w-32 truncate">{jp.equipmentName || '—'}</td>
                  <td className="text-xs font-semibold text-slate-700">{jp.interval || '—'}</td>
                  <td className="text-xs text-slate-600">{jp.lastDone || '—'}</td>
                  <td className="text-xs font-medium text-slate-700">{jp.nextDue || '—'}</td>
                  <td className="text-xs text-slate-600">{jp.estimatedDuration ? `${jp.estimatedDuration}h` : '—'}</td>
                  <td className="text-xs text-slate-600">{jp.responsibleRank || '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {currentRole !== 'technician' && (
                        <button
                          onClick={() => generateJO(jp)}
                          disabled={generatingFor === jp.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                          title="Generate Job Order"
                        >
                          {generatingFor === jp.id ? <Loader size={11} className="animate-spin" /> : <Play size={11} />} JO
                        </button>
                      )}
                      <button onClick={() => openEdit(jp)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Edit"><Pencil size={13} /></button>
                      {currentRole !== 'technician' && (
                        <button onClick={() => setDeleteId(jp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No job plans found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {jobPlans.length} plans
        </div>
      </div>
    </div>
  );
}
