import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobOrders, createJobOrder, updateJobOrder, deleteJobOrder,
} from '../../services/crmService';
import type { JobOrder } from '../../types';

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Awaiting Review', 'Approved', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const RANKS = ['Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer', 'Electrician', 'Fitter', 'Wiper'];

const EMPTY: Partial<JobOrder> = {
  title: '', assignedTo: '', priority: 'Medium', status: 'Not Started', dueDate: '', remarks: '',
};

function Modal({ title, onClose, onSave, saving, error, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}><X size={16} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-red-700 mb-1" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
              <span>{error}</span>
            </div>
          )}
          {children}</div>
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

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";
const sel = inp;

export function JobOrdersPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState<Partial<JobOrder>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: jobOrders, loading, error, reload } = useCrmFetch(
    () => fetchJobOrders(currentVesselId), [currentVesselId]
  );

  const statuses = ['All', ...STATUSES];
  const filtered = jobOrders.filter(jo => {
    const matchSearch = !search ||
      jo.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      jo.title.toLowerCase().includes(search.toLowerCase()) ||
      jo.joNumber.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter === 'All' || jo.status === statusFilter);
  });

  const counts = {
    total: jobOrders.length,
    inProgress: jobOrders.filter(j => j.status === 'In Progress').length,
    awaitingReview: jobOrders.filter(j => j.status === 'Awaiting Review').length,
    overdue: jobOrders.filter(j => j.status === 'Not Started' && j.dueDate && new Date(j.dueDate) < new Date()).length,
  };

  function openCreate() { setForm(EMPTY); setEditId(null); setModalOpen(true); }
  function openEdit(jo: JobOrder) {
    setForm({ title: jo.title, assignedTo: jo.assignedTo, priority: jo.priority, status: jo.status, dueDate: jo.dueDate, remarks: jo.remarks });
    setEditId(jo.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setSaveError(null);
    try {
      if (editId) await updateJobOrder(editId, { status: form.status, remarks: form.remarks });
      else await createJobOrder({ ...form }, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModalOpen(false); reload();
    } catch (e) { setSaveError(String(e)); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteJobOrder(deleteId); setDeleteId(null); reload(); }
    finally { setDeleting(false); }
  }

  const set = (k: keyof JobOrder) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="p-6 min-h-full w-full">
      {modalOpen && (
        <Modal title={editId ? 'Edit Job Order' : 'Create Job Order'} onClose={() => { setModalOpen(false); setSaveError(null); }} onSave={handleSave} saving={saving} error={saveError}>
          <Field label="Job Title *">
            <input className={inp} value={form.title ?? ''} onChange={set('title')} placeholder="e.g. Main Engine – Annual Overhaul" disabled={!!editId} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <select className={sel} value={form.priority ?? 'Medium'} onChange={set('priority')} disabled={!!editId}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={sel} value={form.status ?? 'Not Started'} onChange={set('status')}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Assigned To">
              <select className={sel} value={form.assignedTo ?? ''} onChange={set('assignedTo')} disabled={!!editId}>
                <option value="">Select rank</option>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Due Date">
              <input className={inp} type="date" value={form.dueDate ?? ''} onChange={set('dueDate')} disabled={!!editId} />
            </Field>
          </div>
          <Field label="Work Description / Remarks">
            <textarea className={inp} rows={3} value={form.remarks ?? ''} onChange={set('remarks')} placeholder="Describe the work to be done…" />
          </Field>
        </Modal>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete Job Order?</p>
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
          <h1 className="text-xl font-bold text-slate-900">Job Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Loading…' : `${jobOrders.length} work orders`}</p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary" onClick={openCreate}><Plus size={16} />Create Job Order</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-900' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-sky-700' },
          { label: 'Awaiting Review', value: counts.awaitingReview, color: 'text-purple-700' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search job orders..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr><th>JO Number</th><th>Equipment</th><th>Job Title</th><th>Priority</th><th>Due Date</th><th>Assigned To</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(jo => (
                  <tr key={jo.id}>
                    <td className="text-xs font-mono font-semibold text-sky-700">{jo.joNumber}</td>
                    <td className="text-xs font-medium text-slate-800">{jo.equipmentName || '—'}</td>
                    <td className="text-xs text-slate-700 max-w-48 truncate">{jo.title}</td>
                    <td><PriorityBadge priority={jo.priority} /></td>
                    <td className={`text-xs ${jo.dueDate && new Date(jo.dueDate) < new Date() && jo.status !== 'Completed' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>{jo.dueDate || '—'}</td>
                    <td className="text-xs text-slate-600">{jo.assignedTo || '—'}</td>
                    <td><StatusBadge status={jo.status} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(jo)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Edit"><Pencil size={13} /></button>
                        {currentRole !== 'technician' && (
                          <button onClick={() => setDeleteId(jo.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No job orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {filtered.length} of {jobOrders.length} job orders
        </div>
      </div>
    </div>
  );
}
