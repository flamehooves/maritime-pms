import React, { useState } from 'react';
import {
  Wrench, AlertTriangle, Package, Plus, Paperclip, Clock,
  Settings, ClipboardList, ShoppingBag, Activity, ChevronRight,
  CheckCircle, X, Loader, Pencil, Trash2, Play
} from 'lucide-react';
import type { Equipment, JobOrder, JobPlan, SparePart, Defect } from '../../types';
import { StatusBadge, CriticalityBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobPlans, fetchJobOrders, fetchSpareParts, fetchDefects,
  createJobOrder, createJobPlan, createSparePart, createDefect,
  updateJobOrder, updateJobPlan, updateDefect, updateSparePart,
  deleteJobOrder, deleteJobPlan, deleteSparePart, deleteDefect,
} from '../../services/crmService';

const PRIMARY = '#4f46e6';
const PRIMARY_DIM = 'rgba(79,70,230,0.12)';
const PRIMARY_BORDER = 'rgba(79,70,230,0.3)';

const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
  ...extra,
});

const glassHover = `
  .glass-card { transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease; }
  .glass-card:hover { box-shadow: 0 8px 32px rgba(79,70,230,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9) !important; border-color: rgba(79,70,230,0.25) !important; transform: translateY(-1px); }
  .glass-row { transition: background 0.12s ease; }
  .glass-row:hover { background: rgba(79,70,230,0.04) !important; }
  .glass-btn-primary { background: linear-gradient(135deg, #4f46e6 0%, #3730a3 100%); color: #fff; border: none; border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 2px 8px rgba(79,70,230,0.35), inset 0 1px 0 rgba(255,255,255,0.2); }
  .glass-btn-primary:hover { box-shadow: 0 4px 16px rgba(79,70,230,0.5), inset 0 1px 0 rgba(255,255,255,0.2); transform: translateY(-1px); }
  .glass-btn-secondary { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #374151; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; transition: all 0.15s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9); }
  .glass-btn-secondary:hover { background: rgba(255,255,255,0.9); border-color: rgba(79,70,230,0.25); color: #4f46e6; box-shadow: 0 4px 12px rgba(79,70,230,0.12), inset 0 1px 0 rgba(255,255,255,0.9); transform: translateY(-1px); }
  .tab-glass { display: inline-flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; transition: all 0.15s ease; background: transparent; color: rgba(60,60,67,0.55); white-space: nowrap; }
  .tab-glass:hover { background: rgba(79,70,230,0.07); color: rgba(60,60,67,0.85); }
  .tab-glass.active { background: rgba(79,70,230,0.14); color: #4338ca; box-shadow: inset 0 0 0 1px rgba(79,70,230,0.3); font-weight: 600; }
`;

const tabs = [
  { id: 'overview',    label: 'Overview',   icon: Activity },
  { id: 'jobplans',    label: 'Job Plans',  icon: ClipboardList },
  { id: 'joborders',   label: 'Job Orders', icon: Wrench },
  { id: 'spares',      label: 'Spares',     icon: ShoppingBag },
  { id: 'defects',     label: 'Defects',    icon: AlertTriangle },
  { id: 'attachments', label: 'Attachments',icon: Paperclip },
  { id: 'timeline',    label: 'Timeline',   icon: Clock },
];

interface FieldProps { label: string; value?: string | number | null }
function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</dt>
      <dd style={{ fontSize: 13, color: '#1C1C1E', fontWeight: 500 }}>{value ?? <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>—</span>}</dd>
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const td: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '10px 12px', verticalAlign: 'middle' };
const tdMono: React.CSSProperties = { ...td, fontFamily: 'monospace', fontWeight: 600, color: '#64748B' };

function Modal({ title, onClose, onSave, saving, error, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; error?: string | null; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}><X size={15} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-3">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-red-700" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {children}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5" style={{ background: PRIMARY }}>
            {saving && <Loader size={12} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>{children}</div>;
}

function ConfirmDelete({ onConfirm, onCancel, deleting }: { onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs text-center">
        <Trash2 size={26} className="text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-900 mb-4">Delete this record?</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1">
            {deleting && <Loader size={11} className="animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Timelines & attachments are still static sample data ──────────────────────
const sampleTimeline = [
  { color: 'rgba(16,185,129,0.12)', iconColor: '#059669', icon: CheckCircle, text: 'Job Order completed and approved', user: 'Chief Engineer', time: '1 Dec 2024' },
  { color: 'rgba(239,68,68,0.12)', iconColor: '#DC2626', icon: AlertTriangle, text: 'Defect reported', user: 'Chief Engineer', time: '5 Jan 2025' },
  { color: 'rgba(79,70,230,0.1)', iconColor: '#4f46e6', icon: ClipboardList, text: 'Job Plan linked to equipment', user: 'Fleet Admin', time: '20 Mar 2015' },
];

export function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentRole, currentVesselId } = useApp();
  const [saveError, setSaveError] = useState<string | null>(null);

  // Use the equipment's own vessel when "All Vessels" is selected
  const effectiveVesselId =
    currentVesselId !== '__all__' ? currentVesselId :
    (equipment as Equipment & { vesselId?: string }).vesselId;

  // Live CRM data per tab
  const { data: jobPlans, reload: reloadJP } = useCrmFetch(
    () => fetchJobPlans(currentVesselId).then(jps => jps.filter(jp => jp.equipmentId === equipment.id)), [equipment.id]
  );
  const { data: jobOrders, reload: reloadJO } = useCrmFetch(
    () => fetchJobOrders(currentVesselId).then(jos => jos.filter(jo => jo.equipmentId === equipment.id)), [equipment.id]
  );
  const { data: spares, reload: reloadSP } = useCrmFetch(
    () => fetchSpareParts(currentVesselId).then(sps => sps.filter(sp => sp.equipmentId === equipment.id)), [equipment.id]
  );
  const { data: defects, reload: reloadDef } = useCrmFetch(
    () => fetchDefects(currentVesselId).then(ds => ds.filter(d => d.equipmentId === equipment.id)), [equipment.id]
  );

  // ── Job Order modal ──
  const [joModal, setJoModal] = useState(false);
  const [joEdit, setJoEdit] = useState<string | null>(null);
  const [joForm, setJoForm] = useState<Partial<JobOrder>>({});
  const [joSaving, setJoSaving] = useState(false);
  const [joDel, setJoDel] = useState<string | null>(null);

  async function saveJO() {
    setJoSaving(true); setSaveError(null);
    try {
      if (joEdit) await updateJobOrder(joEdit, { status: joForm.status, remarks: joForm.remarks });
      else await createJobOrder({ ...joForm, equipmentId: equipment.id }, effectiveVesselId);
      setJoModal(false); reloadJO();
    } catch (e) { setSaveError(String(e)); }
    finally { setJoSaving(false); }
  }

  // ── Job Plan modal ──
  const [jpModal, setJpModal] = useState(false);
  const [jpEdit, setJpEdit] = useState<string | null>(null);
  const [jpForm, setJpForm] = useState<Partial<JobPlan>>({});
  const [jpSaving, setJpSaving] = useState(false);
  const [jpDel, setJpDel] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  function autoNextDue(lastDone: string, interval: number): string {
    if (!lastDone || !interval) return '';
    const d = new Date(lastDone);
    d.setDate(d.getDate() + interval);
    return d.toISOString().split('T')[0];
  }

  async function saveJP() {
    setJpSaving(true); setSaveError(null);
    try {
      if (jpEdit) await updateJobPlan(jpEdit, jpForm);
      else await createJobPlan({ ...jpForm, equipmentId: equipment.id }, effectiveVesselId);
      setJpModal(false); reloadJP();
    } catch (e) { setSaveError(String(e)); }
    finally { setJpSaving(false); }
  }

  async function generateJO(jp: JobPlan) {
    setGeneratingFor(jp.id);
    try {
      await createJobOrder({ title: jp.title, assignedTo: jp.responsibleRank, priority: 'Medium', status: 'Not Started', dueDate: jp.nextDue, linkedPlanId: jp.id, equipmentId: equipment.id }, effectiveVesselId);
      reloadJO();
    } finally { setGeneratingFor(null); }
  }

  // ── Spare Part modal ──
  const [spModal, setSpModal] = useState(false);
  const [spEdit, setSpEdit] = useState<string | null>(null);
  const [spForm, setSpForm] = useState<Partial<SparePart>>({});
  const [spSaving, setSpSaving] = useState(false);
  const [spDel, setSpDel] = useState<string | null>(null);

  async function saveSP() {
    setSpSaving(true); setSaveError(null);
    try {
      if (spEdit) await updateSparePart(spEdit, { qtyOnboard: spForm.qtyOnboard, location: spForm.location });
      else await createSparePart({ ...spForm, equipmentId: equipment.id }, effectiveVesselId);
      setSpModal(false); reloadSP();
    } catch (e) { setSaveError(String(e)); }
    finally { setSpSaving(false); }
  }

  // ── Defect modal ──
  const [defModal, setDefModal] = useState(false);
  const [defEdit, setDefEdit] = useState<string | null>(null);
  const [defForm, setDefForm] = useState<Partial<Defect>>({});
  const [defSaving, setDefSaving] = useState(false);
  const [defDel, setDefDel] = useState<string | null>(null);

  async function saveDef() {
    setDefSaving(true); setSaveError(null);
    try {
      if (defEdit) await updateDefect(defEdit, { status: defForm.status, resolution: defForm.resolution, resolvedDate: defForm.resolvedDate });
      else await createDefect({ ...defForm, equipmentId: equipment.id }, effectiveVesselId);
      setDefModal(false); reloadDef();
    } catch (e) { setSaveError(String(e)); }
    finally { setDefSaving(false); }
  }

  const [deleting, setDeleting] = useState(false);
  async function runDelete(fn: () => Promise<void>, reload: () => void) {
    setDeleting(true);
    try { await fn(); reload(); } finally { setDeleting(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      <style>{glassHover}</style>

      {/* Modals */}
      {joModal && (
        <Modal title={joEdit ? 'Update Job Order' : 'Create Job Order'} onClose={() => { setJoModal(false); setSaveError(null); }} onSave={saveJO} saving={joSaving} error={saveError}>
          <FLabel label="Job Title *"><input className={inp} value={joForm.title ?? ''} onChange={e => setJoForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Overhaul" disabled={!!joEdit} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Priority">
              <select className={inp} value={joForm.priority ?? 'Medium'} onChange={e => setJoForm(f => ({ ...f, priority: e.target.value as JobOrder['priority'] }))} disabled={!!joEdit}>
                {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
              </select>
            </FLabel>
            <FLabel label="Status">
              <select className={inp} value={joForm.status ?? 'Not Started'} onChange={e => setJoForm(f => ({ ...f, status: e.target.value as JobOrder['status'] }))}>
                {['Not Started','In Progress','On Hold','Awaiting Review','Approved','Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FLabel>
          </div>
          <FLabel label="Due Date"><input className={inp} type="date" value={joForm.dueDate ?? ''} onChange={e => setJoForm(f => ({ ...f, dueDate: e.target.value }))} disabled={!!joEdit} /></FLabel>
          <FLabel label="Work Description"><textarea className={inp} rows={2} value={joForm.remarks ?? ''} onChange={e => setJoForm(f => ({ ...f, remarks: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {joDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteJobOrder(joDel).then(() => setJoDel(null)), reloadJO)} onCancel={() => setJoDel(null)} deleting={deleting} />}

      {jpModal && (
        <Modal title={jpEdit ? 'Edit Job Plan' : 'Add Job Plan'} onClose={() => { setJpModal(false); setSaveError(null); }} onSave={saveJP} saving={jpSaving} error={saveError}>
          <FLabel label="Plan Title *"><input className={inp} value={jpForm.title ?? ''} onChange={e => setJpForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Overhaul" /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Plan Code"><input className={inp} value={jpForm.code ?? ''} onChange={e => setJpForm(f => ({ ...f, code: e.target.value }))} placeholder="JP-ME-001" /></FLabel>
            <FLabel label="Frequency (days)"><input className={inp} type="number" value={jpForm.interval ?? 90} onChange={e => {
              const interval = Number(e.target.value);
              setJpForm(f => ({ ...f, interval, nextDue: autoNextDue(f.lastDone ?? '', interval) }));
            }} /></FLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Last Done"><input className={inp} type="date" value={jpForm.lastDone ?? ''} onChange={e => {
              const lastDone = e.target.value;
              setJpForm(f => ({ ...f, lastDone, nextDue: autoNextDue(lastDone, f.interval ?? 90) }));
            }} /></FLabel>
            <FLabel label="Next Due"><input className={inp} type="date" value={jpForm.nextDue ?? ''} onChange={e => setJpForm(f => ({ ...f, nextDue: e.target.value }))} /></FLabel>
          </div>
        </Modal>
      )}
      {jpDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteJobPlan(jpDel).then(() => setJpDel(null)), reloadJP)} onCancel={() => setJpDel(null)} deleting={deleting} />}

      {spModal && (
        <Modal title={spEdit ? 'Edit Spare Part' : 'Add Spare Part'} onClose={() => { setSpModal(false); setSaveError(null); }} onSave={saveSP} saving={spSaving} error={saveError}>
          <FLabel label="Part Number *"><input className={inp} value={spForm.partNumber ?? ''} onChange={e => setSpForm(f => ({ ...f, partNumber: e.target.value }))} disabled={!!spEdit} /></FLabel>
          <FLabel label="Description *"><input className={inp} value={spForm.description ?? ''} onChange={e => setSpForm(f => ({ ...f, description: e.target.value }))} disabled={!!spEdit} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Qty on Board"><input className={inp} type="number" min={0} value={spForm.qtyOnboard ?? 0} onChange={e => setSpForm(f => ({ ...f, qtyOnboard: Number(e.target.value) }))} /></FLabel>
            <FLabel label="Min Stock"><input className={inp} type="number" min={0} value={spForm.minStock ?? 0} onChange={e => setSpForm(f => ({ ...f, minStock: Number(e.target.value) }))} disabled={!!spEdit} /></FLabel>
          </div>
          <FLabel label="Storage Location"><input className={inp} value={spForm.location ?? ''} onChange={e => setSpForm(f => ({ ...f, location: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {spDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteSparePart(spDel).then(() => setSpDel(null)), reloadSP)} onCancel={() => setSpDel(null)} deleting={deleting} />}

      {defModal && (
        <Modal title={defEdit ? 'Update Defect' : 'Report Defect'} onClose={() => { setDefModal(false); setSaveError(null); }} onSave={saveDef} saving={defSaving} error={saveError}>
          <FLabel label="Description *"><textarea className={inp} rows={2} value={defForm.description ?? ''} onChange={e => setDefForm(f => ({ ...f, description: e.target.value }))} disabled={!!defEdit} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Severity">
              <select className={inp} value={defForm.severity ?? 'Medium'} onChange={e => setDefForm(f => ({ ...f, severity: e.target.value as Defect['severity'] }))} disabled={!!defEdit}>
                {['Critical','High','Medium','Low'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FLabel>
            <FLabel label="Status">
              <select className={inp} value={defForm.status ?? 'Open'} onChange={e => setDefForm(f => ({ ...f, status: e.target.value as Defect['status'] }))}>
                {['Open','Under Investigation','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FLabel>
          </div>
          {!defEdit && (
            <div className="grid grid-cols-2 gap-3">
              <FLabel label="Reported By"><input className={inp} value={defForm.reportedBy ?? ''} onChange={e => setDefForm(f => ({ ...f, reportedBy: e.target.value }))} /></FLabel>
              <FLabel label="Report Date"><input className={inp} type="date" value={defForm.reportedDate ?? ''} onChange={e => setDefForm(f => ({ ...f, reportedDate: e.target.value }))} /></FLabel>
            </div>
          )}
          {defEdit && (
            <>
              <FLabel label="Corrective Action"><textarea className={inp} rows={2} value={defForm.resolution ?? ''} onChange={e => setDefForm(f => ({ ...f, resolution: e.target.value }))} /></FLabel>
              <FLabel label="Resolved Date"><input className={inp} type="date" value={defForm.resolvedDate ?? ''} onChange={e => setDefForm(f => ({ ...f, resolvedDate: e.target.value }))} /></FLabel>
            </>
          )}
        </Modal>
      )}
      {defDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteDefect(defDel).then(() => setDefDel(null)), reloadDef)} onCancel={() => setDefDel(null)} deleting={deleting} />}

      {/* ── Header ── */}
      <div style={{ ...glass(), borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '14px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {['Equipment', ...(equipment.parentName ? [equipment.parentName] : [])].map((crumb, i, arr) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: 11, color: '#CBD5E1' }}>{crumb}</span>
              <ChevronRight size={11} color="#D1D5DB" />
            </React.Fragment>
          ))}
          <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>{equipment.code}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ ...glass({ borderRadius: 10, padding: '6px 10px', flexShrink: 0, marginTop: 2 }), fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: PRIMARY, boxShadow: `0 2px 8px ${PRIMARY_DIM}`, border: `1px solid ${PRIMARY_BORDER}` }}>
              {equipment.code}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{equipment.name}</h2>
              {equipment.maker && equipment.model && <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{equipment.maker} · {equipment.model}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {equipment.criticality && <CriticalityBadge criticality={equipment.criticality} />}
            {equipment.status && <StatusBadge status={equipment.status} size="md" />}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="glass-btn-primary" onClick={() => { setJoEdit(null); setJoForm({ priority: 'Medium', status: 'Not Started' }); setJoModal(true); }}><Wrench size={13} />Create Job Order</button>
          )}
          <button className="glass-btn-secondary" onClick={() => { setDefEdit(null); setDefForm({ severity: 'Medium', status: 'Open' }); setDefModal(true); }}><AlertTriangle size={13} />Report Defect</button>
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="glass-btn-secondary" onClick={() => { setSpEdit(null); setSpForm({ qtyOnboard: 0, minStock: 0, unit: 'pcs' }); setSpModal(true); }}><Package size={13} />Add Spare</button>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ ...glass({ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }), padding: '6px 14px', display: 'flex', gap: 2, overflowX: 'auto', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-glass ${activeTab === tab.id ? 'active' : ''}`}>
            <tab.icon size={12} />{tab.label}
            {tab.id === 'joborders' && jobOrders.length > 0 && <span style={{ fontSize: 10, background: activeTab === 'joborders' ? PRIMARY_DIM : 'rgba(0,0,0,0.07)', color: activeTab === 'joborders' ? PRIMARY : '#6B7280', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{jobOrders.length}</span>}
            {tab.id === 'defects' && defects.length > 0 && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#DC2626', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{defects.length}</span>}
            {tab.id === 'spares' && spares.length > 0 && <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.07)', color: '#6B7280', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{spares.length}</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Technical Information</div>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                  <Field label="Equipment Code" value={equipment.code} />
                  <Field label="Equipment Type" value={equipment.type} />
                  <Field label="Maker" value={equipment.maker} />
                  <Field label="Model" value={equipment.model} />
                  <Field label="Serial Number" value={equipment.serial} />
                  <Field label="Install Date" value={equipment.installDate} />
                </dl>
              </div>
              <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Operational Status</div>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                  <Field label="Location" value={equipment.location} />
                  <Field label="Responsible Rank" value={equipment.responsibleRank} />
                  <Field label="Criticality" value={equipment.criticality?.toUpperCase()} />
                  <Field label="Current Status" value={equipment.status} />
                  <Field label="Last Maintenance" value={equipment.lastMaintenance} />
                  <Field label="Next Due Date" value={equipment.nextDue} />
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobplans' && (
          <GlassTable title="Linked Maintenance Plans" action={currentRole !== 'technician' ? <button className="glass-btn-primary" onClick={() => { setJpEdit(null); setJpForm({ interval: 90 }); setJpModal(true); }}><Plus size={13} />Add Job Plan</button> : undefined} empty={jobPlans.length === 0} emptyText="No job plans linked." headers={['Plan Code','Title','Freq (days)','Last Done','Next Due','Rank','']}>
            {jobPlans.map(jp => (
              <tr key={jp.id} className="glass-row">
                <td style={tdMono}>{jp.code || '—'}</td>
                <td style={{ ...td, maxWidth: 200 }}>{jp.title}</td>
                <td style={td}>{jp.interval}</td>
                <td style={td}>{jp.lastDone || '—'}</td>
                <td style={{ ...td, fontWeight: 600 }}>{jp.nextDue || '—'}</td>
                <td style={td}>{jp.responsibleRank || '—'}</td>
                <td>
                  <div className="flex items-center gap-1">
                    {currentRole !== 'technician' && <button onClick={() => generateJO(jp)} disabled={generatingFor === jp.id} className="p-1 rounded hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Generate JO">{generatingFor === jp.id ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}</button>}
                    <button onClick={() => { setJpEdit(jp.id); setJpForm(jp); setJpModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={12} /></button>
                    {currentRole !== 'technician' && <button onClick={() => setJpDel(jp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </GlassTable>
        )}

        {activeTab === 'joborders' && (
          <GlassTable title="Work Order History" action={currentRole !== 'technician' ? <button className="glass-btn-primary" onClick={() => { setJoEdit(null); setJoForm({ priority: 'Medium', status: 'Not Started' }); setJoModal(true); }}><Plus size={13} />Create Job Order</button> : undefined} empty={jobOrders.length === 0} emptyText="No job orders for this equipment." headers={['JO Number','Title','Priority','Assigned To','Due Date','Status','']}>
            {jobOrders.map(jo => (
              <tr key={jo.id} className="glass-row">
                <td style={tdMono}>{jo.joNumber}</td>
                <td style={{ ...td, maxWidth: 200 }}>{jo.title}</td>
                <td><PriorityBadge priority={jo.priority} /></td>
                <td style={td}>{jo.assignedTo || '—'}</td>
                <td style={td}>{jo.dueDate || '—'}</td>
                <td><StatusBadge status={jo.status} /></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setJoEdit(jo.id); setJoForm(jo); setJoModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={12} /></button>
                    {currentRole !== 'technician' && <button onClick={() => setJoDel(jo.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </GlassTable>
        )}

        {activeTab === 'spares' && (
          <GlassTable title="Spare Parts" action={currentRole !== 'technician' ? <button className="glass-btn-primary" onClick={() => { setSpEdit(null); setSpForm({ qtyOnboard: 0, minStock: 0, unit: 'pcs' }); setSpModal(true); }}><Plus size={13} />Add Spare</button> : undefined} empty={spares.length === 0} emptyText="No spare parts linked." headers={['Part Number','Description','Maker','Qty','Min','Status','Location','']}>
            {spares.map(sp => {
              const outOfStock = sp.qtyOnboard === 0;
              const low = !outOfStock && sp.qtyOnboard <= sp.minStock;
              return (
                <tr key={sp.id} className="glass-row">
                  <td style={tdMono}>{sp.partNumber}</td>
                  <td style={td}>{sp.description}</td>
                  <td style={td}>{sp.maker || '—'}</td>
                  <td style={{ ...td, fontWeight: 700, color: outOfStock ? '#DC2626' : low ? '#D97706' : '#374151', fontSize: 14 }}>{sp.qtyOnboard}</td>
                  <td style={td}>{sp.minStock}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: outOfStock ? 'rgba(239,68,68,0.1)' : low ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: outOfStock ? '#DC2626' : low ? '#D97706' : '#059669', border: `1px solid ${outOfStock ? 'rgba(239,68,68,0.2)' : low ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{outOfStock ? 'Out of Stock' : low ? 'Low Stock' : 'OK'}</span></td>
                  <td style={td}>{sp.location || '—'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSpEdit(sp.id); setSpForm(sp); setSpModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={12} /></button>
                      {currentRole !== 'technician' && <button onClick={() => setSpDel(sp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </GlassTable>
        )}

        {activeTab === 'defects' && (
          <GlassTable title="Defect Register" action={<button className="glass-btn-secondary" onClick={() => { setDefEdit(null); setDefForm({ severity: 'Medium', status: 'Open' }); setDefModal(true); }}><AlertTriangle size={13} />Report Defect</button>} empty={false} emptyText="" headers={['Defect ID','Description','Severity','Reported By','Date','Status','']}>
            {defects.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px 20px', textAlign: 'center' }}>
                <CheckCircle size={28} color="#10B981" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>No defects recorded</p>
              </td></tr>
            ) : defects.map(d => (
              <tr key={d.id} className="glass-row">
                <td style={tdMono}>{d.defectId}</td>
                <td style={{ ...td, maxWidth: 220 }}>{d.description}</td>
                <td><SeverityBadge severity={d.severity} /></td>
                <td style={td}>{d.reportedBy || '—'}</td>
                <td style={td}>{d.reportedDate || '—'}</td>
                <td><StatusBadge status={d.status} /></td>
                <td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setDefEdit(d.id); setDefForm(d); setDefModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={12} /></button>
                    <button onClick={() => setDefDel(d.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </GlassTable>
        )}

        {activeTab === 'attachments' && (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <button className="glass-btn-primary"><Plus size={13} />Upload Document</button>
            </div>
            <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, paddingTop: 32 }}>Attachment management coming soon.</div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 20 }}>Equipment Audit Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sampleTimeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < sampleTimeline.length - 1 ? 20 : 0, position: 'relative' }}>
                  {i < sampleTimeline.length - 1 && <div style={{ position: 'absolute', left: 17, top: 40, bottom: 0, width: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />}
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: event.color, border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <event.icon size={15} color={event.iconColor} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1E' }}>{event.text}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{event.user} · {event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlassTable({ title, action, headers, children, empty, emptyText }: {
  title: string; action?: React.ReactNode; headers: string[];
  children: React.ReactNode; empty: boolean; emptyText: string;
}) {
  return (
    <div style={{ ...glass({ borderRadius: 16, overflow: 'hidden' }) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{title}</span>
        {action}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
              {headers.map(h => (
                <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EquipmentDetailEmpty() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px', background: 'rgba(79,70,230,0.08)', border: '1px solid rgba(79,70,230,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings size={22} color="#4f46e6" strokeWidth={1.5} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>Select Equipment</h3>
        <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 240, margin: '0 auto', lineHeight: 1.6 }}>Select an equipment item from the tree to view details, job plans, job orders, spares, and defects.</p>
      </div>
    </div>
  );
}
