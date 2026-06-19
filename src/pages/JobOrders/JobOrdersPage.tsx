import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Pencil, Trash2, X, Clock, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobOrders, createJobOrder, updateJobOrder, deleteJobOrder,
  fetchPostponedJobs, createPostponedJob, approvePostponedJob, rejectPostponedJob,
  fetchEquipments,
} from '../../services/crmService';
import type { JobOrder, PostponedJob } from '../../types';

const STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Awaiting Review', 'Approved', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const RANKS = ['Chief Engineer', 'Second Engineer', 'Third Engineer', 'Fourth Engineer', 'Electrician', 'Fitter', 'Wiper'];
const SAFETY_LEVELS = ['Critical', 'High', 'Standard'];
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400';

const EMPTY: Partial<JobOrder> = { title: '', assignedTo: '', priority: 'Medium', status: 'Not Started', dueDate: '', remarks: '' };

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
          {error && <div className="p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-100">{error}</div>}
          {children}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader size={13} className="animate-spin" />}Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>{children}</div>;
}

const SAFETY_COLOR: Record<string, { bg: string; color: string }> = {
  Critical: { bg: 'rgba(220,38,38,0.08)', color: '#DC2626' },
  High:     { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
  Standard: { bg: 'rgba(79,70,230,0.08)', color: '#4f46e6' },
};
const APPROVAL_COLOR: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
  Approved: { bg: 'rgba(16,185,129,0.08)', color: '#059669' },
  Rejected: { bg: 'rgba(220,38,38,0.08)', color: '#DC2626' },
};

type Tab = 'planned' | 'breakdown' | 'postponed';

export function JobOrdersPage() {
  const { currentRole, currentVesselId } = useApp();
  const isAdmin = currentRole !== 'technician';
  const [tab, setTab] = useState<Tab>('planned');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Job orders
  const [form, setForm] = useState<Partial<JobOrder>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Postponed jobs
  const [pjModal, setPjModal] = useState<'add' | 'approve' | 'reject' | null>(null);
  const [pjForm, setPjForm] = useState<Partial<PostponedJob>>({});
  const [pjActionId, setPjActionId] = useState<string | null>(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [pjSaving, setPjSaving] = useState(false);
  const [pjError, setPjError] = useState<string | null>(null);

  const { data: jobOrders, loading: joLoading, error, reload: reloadJO } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);
  const { data: postponed, loading: pjLoading, reload: reloadPJ } = useCrmFetch(() => fetchPostponedJobs(currentVesselId), [currentVesselId]);
  const { data: equipments } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);

  const plannedJOs = jobOrders.filter(jo => !jo.jobType || jo.jobType === 'Planned');
  const breakdownJOs = jobOrders.filter(jo => jo.jobType === 'Breakdown' || jo.jobType === 'Defect Rectification');

  const activeJOs = tab === 'breakdown' ? breakdownJOs : plannedJOs;
  const filtered = activeJOs.filter(jo => {
    const m = !search || jo.equipmentName.toLowerCase().includes(search.toLowerCase()) || jo.title.toLowerCase().includes(search.toLowerCase()) || jo.joNumber.toLowerCase().includes(search.toLowerCase());
    return m && (statusFilter === 'All' || jo.status === statusFilter);
  });

  const counts = {
    total: jobOrders.length,
    inProgress: jobOrders.filter(j => j.status === 'In Progress').length,
    awaitingReview: jobOrders.filter(j => j.status === 'Awaiting Review').length,
    overdue: jobOrders.filter(j => j.status !== 'Completed' && j.status !== 'Approved' && j.dueDate && new Date(j.dueDate) < new Date()).length,
    pendingPJ: postponed.filter(p => p.approvalStatus === 'Pending').length,
  };

  function openEdit(jo: JobOrder) {
    setForm({ title: jo.title, assignedTo: jo.assignedTo, priority: jo.priority, status: jo.status, dueDate: jo.dueDate, remarks: jo.remarks });
    setEditId(jo.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setSaveError(null);
    try {
      if (editId) await updateJobOrder(editId, { status: form.status, remarks: form.remarks });
      else await createJobOrder({ ...form, jobType: tab === 'breakdown' ? 'Breakdown' : 'Planned' }, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModalOpen(false); reloadJO();
    } catch (e) { setSaveError(String(e)); } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteJobOrder(deleteId); setDeleteId(null); reloadJO(); } finally { setDeleting(false); }
  }

  async function handlePJSave() {
    if (!pjForm.jobTitle || !pjForm.postponedToDate) { setPjError('Job title and new due date are required.'); return; }
    setPjSaving(true); setPjError(null);
    try {
      await createPostponedJob(pjForm, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setPjModal(null); reloadPJ();
    } catch (e) { setPjError(String(e)); } finally { setPjSaving(false); }
  }

  async function handleApprove() {
    if (!pjActionId) return;
    setPjSaving(true);
    try { await approvePostponedJob(pjActionId, 'Fleet Manager'); setPjModal(null); reloadPJ(); } catch (e) { setPjError(String(e)); } finally { setPjSaving(false); }
  }

  async function handleReject() {
    if (!pjActionId || !rejectRemarks) { setPjError('Rejection remarks required.'); return; }
    setPjSaving(true);
    try { await rejectPostponedJob(pjActionId, rejectRemarks); setPjModal(null); reloadPJ(); } catch (e) { setPjError(String(e)); } finally { setPjSaving(false); }
  }

  const tdS: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '9px 14px', verticalAlign: 'middle' };

  return (
    <div className="p-6 min-h-full w-full">
      {/* JO Modal */}
      {modalOpen && (
        <Modal title={editId ? 'Edit Job Order' : `Create ${tab === 'breakdown' ? 'Breakdown' : 'Planned'} Job Order`} onClose={() => { setModalOpen(false); setSaveError(null); }} onSave={handleSave} saving={saving} error={saveError}>
          <FLabel label="Job Title *"><input className={inp} value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} disabled={!!editId} /></FLabel>
          <div className="grid grid-cols-2 gap-4">
            <FLabel label="Priority">
              <select className={inp} value={form.priority ?? 'Medium'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as JobOrder['priority'] }))} disabled={!!editId}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </FLabel>
            <FLabel label="Status">
              <select className={inp} value={form.status ?? 'Not Started'} onChange={e => setForm(f => ({ ...f, status: e.target.value as JobOrder['status'] }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FLabel>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FLabel label="Assigned To">
              <select className={inp} value={form.assignedTo ?? ''} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} disabled={!!editId}>
                <option value="">Select rank</option>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </FLabel>
            <FLabel label="Due Date">
              <input className={inp} type="date" value={form.dueDate ?? ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} disabled={!!editId} />
            </FLabel>
          </div>
          <FLabel label="Remarks">
            <textarea className={inp} rows={3} value={form.remarks ?? ''} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
          </FLabel>
        </Modal>
      )}

      {/* Postponement Request Modal */}
      {pjModal === 'add' && (
        <Modal title="Request Job Postponement" onClose={() => { setPjModal(null); setPjError(null); }} onSave={handlePJSave} saving={pjSaving} error={pjError}>
          <FLabel label="Job Title *"><input className={inp} value={pjForm.jobTitle ?? ''} onChange={e => setPjForm(f => ({ ...f, jobTitle: e.target.value }))} /></FLabel>
          <FLabel label="Equipment">
            <select className={inp} value={pjForm.equipmentId ?? ''} onChange={e => setPjForm(f => ({ ...f, equipmentId: e.target.value }))}>
              <option value="">Select…</option>
              {equipments.filter(eq => !eq.isGroup).map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Original Due Date"><input className={inp} type="date" value={pjForm.originalDueDate ?? ''} onChange={e => setPjForm(f => ({ ...f, originalDueDate: e.target.value }))} /></FLabel>
            <FLabel label="Postpone To Date *"><input className={inp} type="date" value={pjForm.postponedToDate ?? ''} onChange={e => setPjForm(f => ({ ...f, postponedToDate: e.target.value }))} /></FLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Safety Level">
              <select className={inp} value={pjForm.safetyLevel ?? 'Standard'} onChange={e => setPjForm(f => ({ ...f, safetyLevel: e.target.value }))}>
                {SAFETY_LEVELS.map(s => <option key={s}>{s}</option>)}
              </select>
            </FLabel>
            <FLabel label="Requested By"><input className={inp} value={pjForm.requestedBy ?? ''} onChange={e => setPjForm(f => ({ ...f, requestedBy: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Reason for Postponement *">
            <textarea className={inp} rows={3} value={pjForm.reason ?? ''} onChange={e => setPjForm(f => ({ ...f, reason: e.target.value }))} />
          </FLabel>
        </Modal>
      )}

      {/* Approve / Reject Modals */}
      {pjModal === 'approve' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Approve Postponement?</p>
            <p className="text-xs text-slate-500 mb-5">This will mark the postponement as approved.</p>
            {pjError && <p className="text-xs text-red-600 mb-3">{pjError}</p>}
            <div className="flex gap-2 justify-center">
              <button onClick={() => setPjModal(null)} className="px-4 py-2 rounded-xl border text-sm text-slate-600">Cancel</button>
              <button onClick={handleApprove} disabled={pjSaving} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">{pjSaving && <Loader size={12} className="animate-spin" />}Approve</button>
            </div>
          </div>
        </div>
      )}
      {pjModal === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <p className="text-sm font-bold text-slate-900 mb-3">Reject Postponement</p>
            {pjError && <p className="text-xs text-red-600 mb-2">{pjError}</p>}
            <textarea className={inp + ' mb-4'} rows={3} placeholder="Reason for rejection…" value={rejectRemarks} onChange={e => setRejectRemarks(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPjModal(null)} className="px-4 py-2 rounded-xl border text-sm text-slate-600">Cancel</button>
              <button onClick={handleReject} disabled={pjSaving} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">{pjSaving && <Loader size={12} className="animate-spin" />}Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold mb-5">Delete this job order?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border text-sm text-slate-600">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">{deleting && <Loader size={12} className="animate-spin" />}Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">{joLoading ? 'Loading…' : `${jobOrders.length} work orders`}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            {tab === 'postponed'
              ? <button className="btn-primary" onClick={() => { setPjForm({}); setPjModal('add'); }}><Plus size={16} />Request Postponement</button>
              : <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setModalOpen(true); }}><Plus size={16} />Create Job Order</button>
            }
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reloadJO} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-900' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-sky-700' },
          { label: 'Awaiting Review', value: counts.awaitingReview, color: 'text-purple-700' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-700' },
          { label: 'Pending Postponements', value: counts.pendingPJ, color: counts.pendingPJ > 0 ? 'text-amber-700' : 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden', width: 'fit-content', marginBottom: 16 }}>
        {([
          { id: 'planned', label: 'Planned Jobs' },
          { id: 'breakdown', label: 'Breakdown / Defect Jobs' },
          { id: 'postponed', label: `Postponed Jobs${counts.pendingPJ > 0 ? ` (${counts.pendingPJ})` : ''}` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{ padding: '7px 16px', fontSize: 12, fontWeight: tab === t.id ? 700 : 500, background: tab === t.id ? '#4f46e6' : 'transparent', color: tab === t.id ? '#fff' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>{t.label}</button>
        ))}
      </div>

      {tab !== 'postponed' ? (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
              <Search size={14} className="text-slate-400" />
              <input type="text" placeholder="Search…" className="text-sm outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {['All', ...STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            {joLoading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400"><Loader size={18} className="animate-spin" />Loading…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead><tr><th>JO Number</th><th>Equipment</th><th>Job Title</th><th>Priority</th><th>Due Date</th><th>Assigned To</th><th>Status</th><th></th></tr></thead>
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
                            <button onClick={() => openEdit(jo)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={13} /></button>
                            {isAdmin && <button onClick={() => setDeleteId(jo.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={13} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && !joLoading && (
                      <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No job orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">Showing {filtered.length} of {activeJOs.length}</div>
          </div>
        </>
      ) : (
        /* Postponed Jobs tab */
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          {pjLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40, color: '#94A3B8', fontSize: 13 }}>
              <Loader size={16} className="animate-spin" />Loading…
            </div>
          ) : postponed.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Clock size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>No postponement requests</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  {['Job Title', 'Equipment', 'Safety Level', 'Original Due', 'Postponed To', 'Count', 'Requested By', 'Approval Status', ''].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {postponed.map(pj => {
                  const sc = SAFETY_COLOR[pj.safetyLevel] ?? SAFETY_COLOR.Standard;
                  const ac = APPROVAL_COLOR[pj.approvalStatus] ?? APPROVAL_COLOR.Pending;
                  return (
                    <tr key={pj.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ ...tdS, fontWeight: 600, maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pj.jobTitle}</span></td>
                      <td style={tdS}>{pj.equipmentName || '—'}</td>
                      <td style={{ ...tdS }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>{pj.safetyLevel}</span>
                      </td>
                      <td style={{ ...tdS, color: '#DC2626', fontWeight: 600 }}>{pj.originalDueDate || '—'}</td>
                      <td style={{ ...tdS, color: '#059669', fontWeight: 600 }}>{pj.postponedToDate || '—'}</td>
                      <td style={{ ...tdS, textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: pj.postponementCount > 1 ? '#DC2626' : '#374151' }}>{pj.postponementCount}×</span>
                      </td>
                      <td style={tdS}>{pj.requestedBy || '—'}</td>
                      <td style={{ ...tdS }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: ac.bg, color: ac.color, border: `1px solid ${ac.color}33` }}>{pj.approvalStatus}</span>
                      </td>
                      <td style={{ padding: '0 10px' }}>
                        {pj.approvalStatus === 'Pending' && isAdmin && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => { setPjActionId(pj.id); setPjModal('approve'); setPjError(null); }} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: 'rgba(5,150,105,0.1)', color: '#059669', borderRadius: 6, border: '1px solid rgba(5,150,105,0.2)', cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => { setPjActionId(pj.id); setRejectRemarks(''); setPjModal('reject'); setPjError(null); }} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: 'rgba(220,38,38,0.08)', color: '#DC2626', borderRadius: 6, border: '1px solid rgba(220,38,38,0.2)', cursor: 'pointer' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
