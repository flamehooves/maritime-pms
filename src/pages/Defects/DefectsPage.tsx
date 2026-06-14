import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchDefects, createDefect, updateDefect, deleteDefect } from '../../services/crmService';
import type { Defect } from '../../types';

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];
const DEF_STATUSES = ['Open', 'Under Investigation', 'Rectified', 'Closed', 'Deferred'];
const EMPTY: Partial<Defect> = { description: '', severity: 'Medium', status: 'Open', reportedBy: '', reportedDate: '' };

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

export function DefectsPage() {
  const { currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [form, setForm] = useState<Partial<Defect>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: defects, loading, error, reload } = useCrmFetch(
    () => fetchDefects(currentVesselId), [currentVesselId]
  );

  const counts = {
    critical: defects.filter(d => d.severity === 'Critical').length,
    high: defects.filter(d => d.severity === 'High').length,
    medium: defects.filter(d => d.severity === 'Medium').length,
    open: defects.filter(d => d.status === 'Open' || d.status === 'Under Investigation').length,
  };

  const filtered = defects.filter(d => {
    const matchSearch = !search ||
      d.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      d.defectId.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (severityFilter === 'All' || d.severity === severityFilter);
  });

  function openCreate() { setForm(EMPTY); setEditId(null); setModalOpen(true); }
  function openEdit(d: Defect) {
    setForm({ description: d.description, severity: d.severity, status: d.status, reportedBy: d.reportedBy, reportedDate: d.reportedDate, resolution: d.resolution, resolvedDate: d.resolvedDate });
    setEditId(d.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) await updateDefect(editId, { status: form.status, resolution: form.resolution, resolvedDate: form.resolvedDate });
      else await createDefect(form, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModalOpen(false); reload();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteDefect(deleteId); setDeleteId(null); reload(); }
    finally { setDeleting(false); }
  }

  const set = (k: keyof Defect) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="p-6 min-h-full w-full">
      {modalOpen && (
        <Modal title={editId ? 'Update Defect' : 'Report Defect'} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <Field label="Description *">
            <textarea className={inp} rows={3} value={form.description ?? ''} onChange={set('description')} placeholder="Describe the defect in detail…" disabled={!!editId} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Severity">
              <select className={inp} value={form.severity ?? 'Medium'} onChange={set('severity')} disabled={!!editId}>
                {SEVERITIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={inp} value={form.status ?? 'Open'} onChange={set('status')}>
                {DEF_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          {!editId && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reported By">
                <input className={inp} value={form.reportedBy ?? ''} onChange={set('reportedBy')} placeholder="Name / rank" />
              </Field>
              <Field label="Report Date">
                <input className={inp} type="date" value={form.reportedDate ?? ''} onChange={set('reportedDate')} />
              </Field>
            </div>
          )}
          {editId && (
            <>
              <Field label="Corrective Action / Resolution">
                <textarea className={inp} rows={3} value={form.resolution ?? ''} onChange={set('resolution')} placeholder="Describe corrective action taken…" />
              </Field>
              <Field label="Resolved Date">
                <input className={inp} type="date" value={form.resolvedDate ?? ''} onChange={set('resolvedDate')} />
              </Field>
            </>
          )}
        </Modal>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete Defect Record?</p>
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
          <h1 className="text-xl font-bold text-slate-900">Defect Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Loading…' : `${defects.length} recorded defects`}</p>
        </div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16} />Report Defect</button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Open Defects', value: counts.open, cls: 'text-slate-900' },
          { label: 'Critical', value: counts.critical, cls: 'text-red-700' },
          { label: 'High Severity', value: counts.high, cls: 'text-orange-700' },
          { label: 'Medium', value: counts.medium, cls: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xl font-bold mt-1 ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search defects..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${severityFilter === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
          ))}
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
              <tr><th>Defect ID</th><th>Equipment</th><th>Severity</th><th>Description</th><th>Reported By</th><th>Date</th><th>Status</th><th>Linked JO</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td className="text-xs font-mono font-semibold text-slate-700">{d.defectId}</td>
                  <td className="text-xs font-medium text-slate-800">{d.equipmentName || '—'}</td>
                  <td><SeverityBadge severity={d.severity} /></td>
                  <td className="text-xs text-slate-700 max-w-64 truncate" title={d.description}>{d.description}</td>
                  <td className="text-xs text-slate-600">{d.reportedBy || '—'}</td>
                  <td className="text-xs text-slate-600">{d.reportedDate || '—'}</td>
                  <td><StatusBadge status={d.status} /></td>
                  <td className="text-xs font-mono text-sky-600">{d.linkedJobOrderNumber || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(d)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Edit / Update Status"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(d.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No defects found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {defects.length} defects
        </div>
      </div>
    </div>
  );
}
