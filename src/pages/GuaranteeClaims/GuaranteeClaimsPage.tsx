import React, { useState } from 'react';
import { Plus, Shield, X, Loader, AlertTriangle, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchGuaranteeClaims, createGuaranteeClaim, updateGuaranteeClaim, deleteGuaranteeClaim, fetchEquipments } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import type { GuaranteeClaim } from '../../types';

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Open':         { bg: 'rgba(239,68,68,0.08)',    color: '#DC2626', border: 'rgba(239,68,68,0.2)' },
  'Under Review': { bg: 'rgba(245,158,11,0.1)',    color: '#D97706', border: 'rgba(245,158,11,0.25)' },
  'Closed':       { bg: 'rgba(16,185,129,0.08)',   color: '#059669', border: 'rgba(16,185,129,0.2)' },
  'Rejected':     { bg: 'rgba(107,114,128,0.08)',  color: '#6B7280', border: 'rgba(107,114,128,0.2)' },
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS['Open'];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>{children}</div>;
}

function Modal({ title, onClose, onSave, saving, error, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}><X size={15} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-3">
          {error && <div className="flex gap-2 p-3 rounded-xl text-xs text-red-700" style={{ background: '#FEE2E2' }}><AlertTriangle size={13} className="mt-0.5 shrink-0" />{error}</div>}
          {children}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5" style={{ background: '#4f46e6' }}>
            {saving && <Loader size={12} className="animate-spin" />}Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuaranteeClaimsPage() {
  const { currentVesselId, currentRole } = useApp();
  const isAdmin = currentRole === 'admin' || currentRole === 'chief_engineer';

  const { data: claims, loading, reload } = useCrmFetch(() => fetchGuaranteeClaims(currentVesselId), [currentVesselId]);
  const { data: equipments } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<GuaranteeClaim>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = claims.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (dateFrom && c.claimDate && c.claimDate < dateFrom) return false;
    if (dateTo && c.claimDate && c.claimDate > dateTo) return false;
    return true;
  });

  const counts = { total: claims.length, open: claims.filter(c => c.status === 'Open').length, review: claims.filter(c => c.status === 'Under Review').length, closed: claims.filter(c => c.status === 'Closed').length };

  async function handleSave() {
    setSaving(true); setSaveError(null);
    try {
      if (modal === 'edit' && editId) await updateGuaranteeClaim(editId, form);
      else await createGuaranteeClaim(form, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModal(null); reload();
    } catch (e) { setSaveError(String(e)); } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try { await deleteGuaranteeClaim(id); reload(); } finally { setDeleting(null); }
  }

  const td: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '10px 14px', verticalAlign: 'middle' };

  return (
    <div style={{ padding: 24, minHeight: '100%', background: '#F8FAFC' }}>
      {modal && (
        <Modal title={modal === 'edit' ? 'Update Guarantee Claim' : 'New Guarantee Claim'} onClose={() => { setModal(null); setSaveError(null); }} onSave={handleSave} saving={saving} error={saveError}>
          <FLabel label="Equipment *">
            <select className={inp} value={form.equipmentId ?? ''} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
              <option value="">Select equipment</option>
              {equipments.filter(eq => !eq.isGroup).map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Vendor Ref. Number"><input className={inp} value={form.vendorRefNumber ?? ''} onChange={e => setForm(f => ({ ...f, vendorRefNumber: e.target.value }))} placeholder="e.g. WARTSILA-2026-001" /></FLabel>
            <FLabel label="Claim Date"><input className={inp} type="date" value={form.claimDate ?? ''} onChange={e => setForm(f => ({ ...f, claimDate: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Vendor Name"><input className={inp} value={form.vendorName ?? ''} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))} /></FLabel>
          <FLabel label="Defect Description *"><textarea className={inp} rows={3} value={form.defectDescription ?? ''} onChange={e => setForm(f => ({ ...f, defectDescription: e.target.value }))} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Claim Amount (USD)"><input className={inp} type="number" min={0} value={form.claimAmount ?? ''} onChange={e => setForm(f => ({ ...f, claimAmount: Number(e.target.value) }))} /></FLabel>
            <FLabel label="Linked Defect / JO Ref"><input className={inp} value={form.linkedDefectJo ?? ''} onChange={e => setForm(f => ({ ...f, linkedDefectJo: e.target.value }))} placeholder="DEF-XXX" /></FLabel>
          </div>
          <FLabel label="Status">
            <select className={inp} value={form.status ?? 'Open'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Open', 'Under Review', 'Closed', 'Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          </FLabel>
          {(form.status === 'Closed' || form.status === 'Rejected') && (
            <>
              <FLabel label="Resolution"><textarea className={inp} rows={2} value={form.resolution ?? ''} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))} /></FLabel>
              <FLabel label="Resolved Date"><input className={inp} type="date" value={form.resolvedDate ?? ''} onChange={e => setForm(f => ({ ...f, resolvedDate: e.target.value }))} /></FLabel>
            </>
          )}
        </Modal>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(79,70,230,0.1)', border: '1px solid rgba(79,70,230,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={15} color="#4f46e6" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>Guarantee Claims</h1>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 42 }}>Warranty & guarantee claims against equipment vendors</p>
        </div>
        {isAdmin && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #4f46e6, #3730a3)', boxShadow: '0 2px 8px rgba(79,70,230,0.35)' }}
            onClick={() => { setForm({ status: 'Open' }); setEditId(null); setModal('add'); }}
          >
            <Plus size={14} />New Claim
          </button>
        )}
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Claims', value: counts.total, color: '#4f46e6', bg: 'rgba(79,70,230,0.07)' },
          { label: 'Open', value: counts.open, color: '#DC2626', bg: 'rgba(239,68,68,0.07)' },
          { label: 'Under Review', value: counts.review, color: '#D97706', bg: 'rgba(245,158,11,0.07)' },
          { label: 'Closed', value: counts.closed, color: '#059669', bg: 'rgba(16,185,129,0.07)' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden' }}>
          {['All', 'Open', 'Under Review', 'Closed', 'Rejected'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: statusFilter === s ? 700 : 500, background: statusFilter === s ? '#4f46e6' : 'transparent', color: statusFilter === s ? '#fff' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>{s}</button>
          ))}
        </div>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, background: '#fff', color: '#374151' }} />
        <span style={{ fontSize: 12, color: '#94A3B8' }}>→</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, background: '#fff', color: '#374151' }} />
        {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ fontSize: 11, color: '#94A3B8', cursor: 'pointer', background: 'none', border: 'none' }}>Clear</button>}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40, color: '#94A3B8', fontSize: 13 }}>
            <Loader size={16} className="animate-spin" />Loading claims…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>No guarantee claims found</p>
            <p style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Claims will appear here once raised against vendors.</p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  {['Claim No.', 'Equipment', 'Vendor Ref. No.', 'Vendor', 'Claim Date', 'Amount (USD)', 'Linked Defect JO', 'Status', ''].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <tr
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', background: expandedId === c.id ? 'rgba(79,70,230,0.03)' : undefined }}
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      onMouseEnter={e => { if (expandedId !== c.id) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.015)'; }}
                      onMouseLeave={e => { if (expandedId !== c.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ ...td, fontFamily: 'monospace', fontWeight: 700, color: '#4f46e6' }}>{c.name}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{c.equipmentName || '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#64748B' }}>{c.vendorRefNumber || '—'}</td>
                      <td style={td}>{c.vendorName || '—'}</td>
                      <td style={td}>{c.claimDate || '—'}</td>
                      <td style={{ ...td, fontWeight: 600, color: c.claimAmount ? '#1C1C1E' : '#94A3B8' }}>{c.claimAmount ? `$${c.claimAmount.toLocaleString()}` : '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#64748B' }}>{c.linkedDefectJo || '—'}</td>
                      <td><StatusChip status={c.status} /></td>
                      <td style={{ padding: '0 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <ChevronDown size={13} color="#94A3B8" style={{ transform: expandedId === c.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s' }} />
                          {isAdmin && (
                            <>
                              <button onClick={e => { e.stopPropagation(); setEditId(c.id); setForm(c); setModal('edit'); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                              <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} disabled={deleting === c.id} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500">{deleting === c.id ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr style={{ background: 'rgba(79,70,230,0.02)' }}>
                        <td colSpan={9} style={{ padding: '14px 18px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Defect Description</div>
                              <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{c.defectDescription || '—'}</p>
                            </div>
                            {c.resolution && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Resolution</div>
                                <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{c.resolution}</p>
                                {c.resolvedDate && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Resolved: {c.resolvedDate}</p>}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
