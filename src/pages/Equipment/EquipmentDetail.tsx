import React, { useState, useRef } from 'react';
import {
  Wrench, AlertTriangle, Package, Plus, Paperclip, Settings,
  ClipboardList, ShoppingBag, ChevronRight, CheckCircle, X, Loader,
  Pencil, Trash2, Play, FileText, Shield, BookOpen, Upload, Download,
  ClipboardCheck, ShoppingCart, MoveVertical, AlertCircle,
} from 'lucide-react';
import type {
  Equipment, JobOrder, JobPlan, SparePart, Defect,
  EquipmentSpec, EquipmentSurvey, ConditionOfClass, EquipmentMemorandum, HseqRecord, CrmAttachment,
} from '../../types';
import { StatusBadge, CriticalityBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobPlans, fetchJobOrders, fetchSpareParts, fetchDefects,
  createJobOrder, createJobPlan, createSparePart, createDefect,
  updateJobOrder, updateJobPlan, updateDefect, updateSparePart,
  deleteJobOrder, deleteJobPlan, deleteSparePart, deleteDefect,
  FREQ_OPTIONS, FREQ_TO_DAYS,
  fetchSpecs, createSpec, deleteSpec,
  fetchSurveys, createSurvey, deleteSurvey,
  fetchCocs, createCoc, deleteCoc,
  fetchMemos, createMemo, deleteMemo,
  fetchHseq, createHseqRecord, deleteHseqRecord,
  fetchAttachments, uploadAttachment, deleteAttachment, getAttachmentDownloadUrl,
} from '../../services/crmService';

// ── Styles ──────────────────────────────────────────────────────────────────

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

const CSS = `
  .glass-btn-primary { background: linear-gradient(135deg, #4f46e6 0%, #3730a3 100%); color: #fff; border: none; border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 8px rgba(79,70,230,0.35), inset 0 1px 0 rgba(255,255,255,0.2); }
  .glass-btn-primary:hover { box-shadow: 0 4px 16px rgba(79,70,230,0.5); transform: translateY(-1px); }
  .glass-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .glass-btn-secondary { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #374151; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px; padding: 7px 14px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; transition: all 0.15s; box-shadow: 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9); }
  .glass-btn-secondary:hover { background: rgba(255,255,255,0.9); border-color: rgba(79,70,230,0.25); color: #4f46e6; transform: translateY(-1px); }
  .glass-row { transition: background 0.1s; }
  .glass-row:hover { background: rgba(79,70,230,0.03) !important; }
  .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 9px 14px; border-radius: 10px; cursor: pointer; font-size: 12.5px; font-weight: 500; color: rgba(60,60,67,0.65); transition: all 0.12s; border: none; background: transparent; width: 100%; text-align: left; gap: 6px; }
  .nav-item:hover { background: rgba(79,70,230,0.06); color: #1C1C1E; }
  .nav-item.active { background: rgba(79,70,230,0.14); color: #4338ca; font-weight: 600; box-shadow: inset 0 0 0 1px rgba(79,70,230,0.3); }
  .sub-tab { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: rgba(60,60,67,0.55); white-space: nowrap; transition: all 0.12s; }
  .sub-tab:hover { background: rgba(79,70,230,0.06); color: #374151; }
  .sub-tab.active { background: white; color: #4338ca; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .badge-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
`;

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";
const td: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '9px 12px', verticalAlign: 'middle' };
const tdMono: React.CSSProperties = { ...td, fontFamily: 'monospace', fontWeight: 600, color: '#5B6169' };

// ── Helper Components ────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const isEmpty = value === null || value === undefined || value === '';
  const display = typeof value === 'boolean'
    ? <span style={{ fontWeight: 600, color: value ? '#059669' : '#DC2626' }}>{value ? 'Yes' : 'No'}</span>
    : isEmpty ? <span style={{ color: '#CBD5E1' }}>—</span>
    : <span>{String(value)}</span>;
  return (
    <div>
      <dt style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</dt>
      <dd style={{ fontSize: 13, color: '#1C1C1E', fontWeight: 500 }}>{display}</dd>
    </div>
  );
}

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>{children}</div>;
}

function Modal({ title, onClose, onSave, saving, error, children, wide }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean;
  error?: string | null; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button onClick={onClose}><X size={15} className="text-slate-400" /></button>
        </div>
        <div className="overflow-y-auto p-5 flex flex-col gap-3">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs text-red-700" style={{ background: '#FEE2E2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={13} className="mt-0.5 shrink-0" /><span>{error}</span>
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

function GlassTable({ title, action, headers, children, empty, emptyText, loading }: {
  title?: string; action?: React.ReactNode; headers: string[];
  children: React.ReactNode; empty: boolean; emptyText: string; loading?: boolean;
}) {
  return (
    <div style={{ ...glass({ borderRadius: 14, overflow: 'hidden' }) }}>
      {(title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          {title && <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{title}</span>}
          {action}
        </div>
      )}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, color: '#94A3B8', fontSize: 13 }}>
          <Loader size={16} className="animate-spin" /> Loading…
        </div>
      ) : empty ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>{emptyText}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {headers.map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CountBadge({ count, color }: { count: number; color?: string }) {
  if (!count) return null;
  return (
    <span style={{ fontSize: 10, background: color ?? PRIMARY_DIM, color: color ? 'white' : PRIMARY, padding: '1px 7px', borderRadius: 99, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{count}</span>
  );
}

function NavItem({ label, icon: Icon, active, onClick, count, danger }: {
  label: string; icon?: React.ComponentType<{ size: number }>; active: boolean; onClick: () => void; count?: number; danger?: boolean;
}) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick} style={danger && !active ? { color: '#DC2626' } : undefined}>
      {Icon && <Icon size={13} />}
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && count > 0 && <CountBadge count={count} color={danger ? '#DC2626' : undefined} />}
    </button>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

type MainTab = 'general' | 'jobplans' | 'spares' | 'joborders' | 'service_letter' | 'qdms' | 'purchase' | 'mount';
type GenTab = 'basic' | 'spec' | 'attachments' | 'manual' | 'survey' | 'coc' | 'memo' | 'hseq';

export function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const [mainTab, setMainTab] = useState<MainTab>('general');
  const [genTab, setGenTab] = useState<GenTab>('basic');
  const { currentRole, currentVesselId } = useApp();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const effectiveVesselId =
    currentVesselId !== '__all__' ? currentVesselId : equipment.vesselId;

  // ── Data Fetching ──
  const { data: jobPlans, reload: reloadJP } = useCrmFetch(
    () => fetchJobPlans(currentVesselId).then(jps => jps.filter(jp => jp.equipmentId === equipment.id)), [equipment.id]);
  const { data: jobOrders, reload: reloadJO } = useCrmFetch(
    () => fetchJobOrders(currentVesselId).then(jos => jos.filter(jo => jo.equipmentId === equipment.id)), [equipment.id]);
  const { data: spares, reload: reloadSP } = useCrmFetch(
    () => fetchSpareParts(currentVesselId).then(sps => sps.filter(sp => sp.equipmentId === equipment.id)), [equipment.id]);
  const { data: defects, reload: reloadDef } = useCrmFetch(
    () => fetchDefects(currentVesselId).then(ds => ds.filter(d => d.equipmentId === equipment.id)), [equipment.id]);
  const { data: specs, loading: specsLoading, reload: reloadSpecs } = useCrmFetch(
    () => fetchSpecs(equipment.id), [equipment.id]);
  const { data: surveys, loading: surveysLoading, reload: reloadSurveys } = useCrmFetch(
    () => fetchSurveys(equipment.id), [equipment.id]);
  const { data: cocs, loading: cocsLoading, reload: reloadCocs } = useCrmFetch(
    () => fetchCocs(equipment.id), [equipment.id]);
  const { data: memos, loading: memosLoading, reload: reloadMemos } = useCrmFetch(
    () => fetchMemos(equipment.id), [equipment.id]);
  const { data: hseqRecords, loading: hseqLoading, reload: reloadHseq } = useCrmFetch(
    () => fetchHseq(equipment.id), [equipment.id]);
  const { data: attachments, loading: attLoading, reload: reloadAtt } = useCrmFetch(
    () => fetchAttachments('Equipments', equipment.id), [equipment.id]);

  const manualAttachments = attachments.filter(a => /manual|user.?manual/i.test(a.fileName + ' ' + (a.description ?? '')));
  const generalAttachments = attachments.filter(a => !/manual|user.?manual/i.test(a.fileName + ' ' + (a.description ?? '')));

  // ── Delete helper ──
  async function runDelete(fn: () => Promise<void>, reload: () => void) {
    setDeleting(true);
    try { await fn(); reload(); } finally { setDeleting(false); }
  }

  // ── Job Order ──
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
    } catch (e) { setSaveError(String(e)); } finally { setJoSaving(false); }
  }

  // ── Job Plan ──
  const [jpModal, setJpModal] = useState(false);
  const [jpEdit, setJpEdit] = useState<string | null>(null);
  const [jpForm, setJpForm] = useState<Partial<JobPlan>>({});
  const [jpSaving, setJpSaving] = useState(false);
  const [jpDel, setJpDel] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  function autoNextDue(lastDone: string, interval: number): string {
    if (!lastDone || !interval) return '';
    const d = new Date(lastDone); d.setDate(d.getDate() + interval);
    return d.toISOString().split('T')[0];
  }
  async function saveJP() {
    setJpSaving(true); setSaveError(null);
    try {
      if (jpEdit) await updateJobPlan(jpEdit, jpForm);
      else await createJobPlan({ ...jpForm, equipmentId: equipment.id }, effectiveVesselId);
      setJpModal(false); reloadJP();
    } catch (e) { setSaveError(String(e)); } finally { setJpSaving(false); }
  }
  async function generateJO(jp: JobPlan) {
    setGeneratingFor(jp.id);
    try {
      await createJobOrder({ title: jp.title, assignedTo: jp.responsibleRank, priority: 'Medium', status: 'Not Started', dueDate: jp.nextDue, linkedPlanId: jp.id, equipmentId: equipment.id }, effectiveVesselId);
      reloadJO();
    } finally { setGeneratingFor(null); }
  }

  // ── Spare Part ──
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
    } catch (e) { setSaveError(String(e)); } finally { setSpSaving(false); }
  }

  // ── Defect ──
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
    } catch (e) { setSaveError(String(e)); } finally { setDefSaving(false); }
  }

  // ── Specification ──
  const [specModal, setSpecModal] = useState(false);
  const [specForm, setSpecForm] = useState<Partial<EquipmentSpec>>({});
  const [specSaving, setSpecSaving] = useState(false);
  const [specDel, setSpecDel] = useState<string | null>(null);
  async function saveSpec() {
    setSpecSaving(true); setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createSpec({ ...specForm, equipmentId: equipment.id } as any);
      setSpecModal(false); reloadSpecs();
    } catch (e) { setSaveError(String(e)); } finally { setSpecSaving(false); }
  }

  // ── Survey ──
  const [surveyModal, setSurveyModal] = useState(false);
  const [surveyForm, setSurveyForm] = useState<Partial<EquipmentSurvey>>({});
  const [surveySaving, setSurveySaving] = useState(false);
  const [surveyDel, setSurveyDel] = useState<string | null>(null);
  async function saveSurvey() {
    setSurveySaving(true); setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createSurvey({ ...surveyForm, equipmentId: equipment.id } as any);
      setSurveyModal(false); reloadSurveys();
    } catch (e) { setSaveError(String(e)); } finally { setSurveySaving(false); }
  }

  // ── COC ──
  const [cocModal, setCocModal] = useState(false);
  const [cocForm, setCocForm] = useState<Partial<ConditionOfClass>>({});
  const [cocSaving, setCocSaving] = useState(false);
  const [cocDel, setCocDel] = useState<string | null>(null);
  async function saveCoc() {
    setCocSaving(true); setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createCoc({ ...cocForm, equipmentId: equipment.id } as any);
      setCocModal(false); reloadCocs();
    } catch (e) { setSaveError(String(e)); } finally { setCocSaving(false); }
  }

  // ── Memo ──
  const [memoModal, setMemoModal] = useState(false);
  const [memoForm, setMemoForm] = useState<Partial<EquipmentMemorandum>>({});
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoDel, setMemoDel] = useState<string | null>(null);
  async function saveMemo() {
    setMemoSaving(true); setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createMemo({ ...memoForm, equipmentId: equipment.id } as any);
      setMemoModal(false); reloadMemos();
    } catch (e) { setSaveError(String(e)); } finally { setMemoSaving(false); }
  }

  // ── HSEQ ──
  const [hseqModal, setHseqModal] = useState(false);
  const [hseqForm, setHseqForm] = useState<Partial<HseqRecord>>({});
  const [hseqSaving, setHseqSaving] = useState(false);
  const [hseqDel, setHseqDel] = useState<string | null>(null);
  async function saveHseq() {
    setHseqSaving(true); setSaveError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createHseqRecord({ ...hseqForm, equipmentId: equipment.id } as any);
      setHseqModal(false); reloadHseq();
    } catch (e) { setSaveError(String(e)); } finally { setHseqSaving(false); }
  }

  // ── Attachments ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [attDel, setAttDel] = useState<string | null>(null);

  async function handleUpload(file: File, isManual = false) {
    if (!file) return;
    setUploading(true);
    try {
      const desc = isManual ? 'User Manual' : undefined;
      await uploadAttachment('Equipments', equipment.id, file, desc);
      reloadAtt();
    } catch (e) { alert(String(e)); } finally { setUploading(false); }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const isAdmin = currentRole === 'admin' || currentRole === 'chief_engineer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* ── Modals ── */}
      {joModal && (
        <Modal title={joEdit ? 'Update Job Order' : 'Create Job Order'} onClose={() => { setJoModal(false); setSaveError(null); }} onSave={saveJO} saving={joSaving} error={saveError}>
          <FLabel label="Job Title *"><input className={inp} value={joForm.title ?? ''} onChange={e => setJoForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Overhaul" disabled={!!joEdit} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Priority"><select className={inp} value={joForm.priority ?? 'Medium'} onChange={e => setJoForm(f => ({ ...f, priority: e.target.value as JobOrder['priority'] }))} disabled={!!joEdit}>{['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}</select></FLabel>
            <FLabel label="Status"><select className={inp} value={joForm.status ?? 'Not Started'} onChange={e => setJoForm(f => ({ ...f, status: e.target.value as JobOrder['status'] }))}>{['Not Started','In Progress','On Hold','Awaiting Review','Approved','Completed'].map(s => <option key={s}>{s}</option>)}</select></FLabel>
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
            <FLabel label="Plan Code"><input className={inp} value={jpForm.code ?? ''} onChange={e => setJpForm(f => ({ ...f, code: e.target.value }))} placeholder="JP-001" /></FLabel>
            <FLabel label="Frequency"><select className={inp} value={Object.entries(FREQ_TO_DAYS).find(([, d]) => d === jpForm.interval)?.[0] ?? 'Quarterly'} onChange={e => { const interval = FREQ_TO_DAYS[e.target.value] ?? 90; setJpForm(f => ({ ...f, interval, nextDue: autoNextDue(f.lastDone ?? '', interval) })); }}>{FREQ_OPTIONS.map(o => <option key={o}>{o}</option>)}</select></FLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Last Done"><input className={inp} type="date" value={jpForm.lastDone ?? ''} onChange={e => { const lastDone = e.target.value; setJpForm(f => ({ ...f, lastDone, nextDue: autoNextDue(lastDone, f.interval ?? 90) })); }} /></FLabel>
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
            <FLabel label="Severity"><select className={inp} value={defForm.severity ?? 'Medium'} onChange={e => setDefForm(f => ({ ...f, severity: e.target.value as Defect['severity'] }))} disabled={!!defEdit}>{['Critical','High','Medium','Low'].map(s => <option key={s}>{s}</option>)}</select></FLabel>
            <FLabel label="Status"><select className={inp} value={defForm.status ?? 'Open'} onChange={e => setDefForm(f => ({ ...f, status: e.target.value as Defect['status'] }))}>{['Open','Under Investigation','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}</select></FLabel>
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

      {specModal && (
        <Modal title="Add Specification" onClose={() => { setSpecModal(false); setSaveError(null); }} onSave={saveSpec} saving={specSaving} error={saveError}>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Category"><input className={inp} value={specForm.category ?? ''} onChange={e => setSpecForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. Performance" /></FLabel>
            <FLabel label="Sequence No"><input className={inp} type="number" value={specForm.sequenceNo ?? ''} onChange={e => setSpecForm(f => ({ ...f, sequenceNo: Number(e.target.value) }))} /></FLabel>
          </div>
          <FLabel label="Specification Name *"><input className={inp} value={specForm.specName ?? ''} onChange={e => setSpecForm(f => ({ ...f, specName: e.target.value }))} placeholder="e.g. Maximum Continuous Rating" /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Value *"><input className={inp} value={specForm.specValue ?? ''} onChange={e => setSpecForm(f => ({ ...f, specValue: e.target.value }))} placeholder="e.g. 18,660" /></FLabel>
            <FLabel label="Unit"><input className={inp} value={specForm.unit ?? ''} onChange={e => setSpecForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. kW" /></FLabel>
          </div>
        </Modal>
      )}
      {specDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteSpec(specDel).then(() => setSpecDel(null)), reloadSpecs)} onCancel={() => setSpecDel(null)} deleting={deleting} />}

      {surveyModal && (
        <Modal title="Add Survey Record" onClose={() => { setSurveyModal(false); setSaveError(null); }} onSave={saveSurvey} saving={surveySaving} error={saveError} wide>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Survey Type *"><select className={inp} value={surveyForm.surveyType ?? ''} onChange={e => setSurveyForm(f => ({ ...f, surveyType: e.target.value }))}>
              <option value="">Select type</option>
              {['Annual', 'Special Periodical', 'Renewal', 'Intermediate', 'Docking', 'Continuous'].map(t => <option key={t}>{t}</option>)}
            </select></FLabel>
            <FLabel label="Status"><select className={inp} value={surveyForm.status ?? 'Valid'} onChange={e => setSurveyForm(f => ({ ...f, status: e.target.value }))}>
              {['Valid', 'Expired', 'Due Soon', 'Overdue', 'Completed'].map(s => <option key={s}>{s}</option>)}
            </select></FLabel>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Survey Date"><input className={inp} type="date" value={surveyForm.surveyDate ?? ''} onChange={e => setSurveyForm(f => ({ ...f, surveyDate: e.target.value }))} /></FLabel>
            <FLabel label="Due Date"><input className={inp} type="date" value={surveyForm.dueDate ?? ''} onChange={e => setSurveyForm(f => ({ ...f, dueDate: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Certificate Number"><input className={inp} value={surveyForm.certificateNumber ?? ''} onChange={e => setSurveyForm(f => ({ ...f, certificateNumber: e.target.value }))} placeholder="e.g. DNV-2024-001" /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Surveyor"><input className={inp} value={surveyForm.surveyor ?? ''} onChange={e => setSurveyForm(f => ({ ...f, surveyor: e.target.value }))} /></FLabel>
            <FLabel label="Classification Society"><input className={inp} value={surveyForm.classificationSociety ?? ''} onChange={e => setSurveyForm(f => ({ ...f, classificationSociety: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Remarks"><textarea className={inp} rows={2} value={surveyForm.remarks ?? ''} onChange={e => setSurveyForm(f => ({ ...f, remarks: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {surveyDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteSurvey(surveyDel).then(() => setSurveyDel(null)), reloadSurveys)} onCancel={() => setSurveyDel(null)} deleting={deleting} />}

      {cocModal && (
        <Modal title="Add Condition of Class" onClose={() => { setCocModal(false); setSaveError(null); }} onSave={saveCoc} saving={cocSaving} error={saveError} wide>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="COC Number *"><input className={inp} value={cocForm.cocNumber ?? ''} onChange={e => setCocForm(f => ({ ...f, cocNumber: e.target.value }))} placeholder="e.g. COC-2024-001" /></FLabel>
            <FLabel label="Status"><select className={inp} value={cocForm.status ?? 'Open'} onChange={e => setCocForm(f => ({ ...f, status: e.target.value }))}>
              {['Open', 'Closed', 'Extended', 'Waived'].map(s => <option key={s}>{s}</option>)}
            </select></FLabel>
          </div>
          <FLabel label="Description *"><textarea className={inp} rows={3} value={cocForm.description ?? ''} onChange={e => setCocForm(f => ({ ...f, description: e.target.value }))} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Issued Date"><input className={inp} type="date" value={cocForm.issuedDate ?? ''} onChange={e => setCocForm(f => ({ ...f, issuedDate: e.target.value }))} /></FLabel>
            <FLabel label="Due Date"><input className={inp} type="date" value={cocForm.dueDate ?? ''} onChange={e => setCocForm(f => ({ ...f, dueDate: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Remarks"><textarea className={inp} rows={2} value={cocForm.remarks ?? ''} onChange={e => setCocForm(f => ({ ...f, remarks: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {cocDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteCoc(cocDel).then(() => setCocDel(null)), reloadCocs)} onCancel={() => setCocDel(null)} deleting={deleting} />}

      {memoModal && (
        <Modal title="Add Memorandum" onClose={() => { setMemoModal(false); setSaveError(null); }} onSave={saveMemo} saving={memoSaving} error={saveError} wide>
          <FLabel label="Subject *"><input className={inp} value={memoForm.subject ?? ''} onChange={e => setMemoForm(f => ({ ...f, subject: e.target.value }))} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Date"><input className={inp} type="date" value={memoForm.memoDate ?? ''} onChange={e => setMemoForm(f => ({ ...f, memoDate: e.target.value }))} /></FLabel>
            <FLabel label="Priority"><select className={inp} value={memoForm.priority ?? 'Info'} onChange={e => setMemoForm(f => ({ ...f, priority: e.target.value }))}>
              {['High', 'Medium', 'Low', 'Info'].map(p => <option key={p}>{p}</option>)}
            </select></FLabel>
          </div>
          <FLabel label="Author"><input className={inp} value={memoForm.author ?? ''} onChange={e => setMemoForm(f => ({ ...f, author: e.target.value }))} /></FLabel>
          <FLabel label="Content *"><textarea className={inp} rows={4} value={memoForm.content ?? ''} onChange={e => setMemoForm(f => ({ ...f, content: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {memoDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteMemo(memoDel).then(() => setMemoDel(null)), reloadMemos)} onCancel={() => setMemoDel(null)} deleting={deleting} />}

      {hseqModal && (
        <Modal title="Add HSEQ Record" onClose={() => { setHseqModal(false); setSaveError(null); }} onSave={saveHseq} saving={hseqSaving} error={saveError} wide>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Record Type *"><select className={inp} value={hseqForm.recordType ?? ''} onChange={e => setHseqForm(f => ({ ...f, recordType: e.target.value }))}>
              <option value="">Select type</option>
              {['Risk Assessment', 'Safety Notice', 'Incident Report', 'Near Miss', 'Safety Inspection', 'Environmental Observation'].map(t => <option key={t}>{t}</option>)}
            </select></FLabel>
            <FLabel label="Status"><select className={inp} value={hseqForm.status ?? 'Open'} onChange={e => setHseqForm(f => ({ ...f, status: e.target.value }))}>
              {['Open', 'Closed', 'Reviewed', 'Action Required'].map(s => <option key={s}>{s}</option>)}
            </select></FLabel>
          </div>
          <FLabel label="Title *"><input className={inp} value={hseqForm.title ?? ''} onChange={e => setHseqForm(f => ({ ...f, title: e.target.value }))} /></FLabel>
          <div className="grid grid-cols-2 gap-3">
            <FLabel label="Date"><input className={inp} type="date" value={hseqForm.date ?? ''} onChange={e => setHseqForm(f => ({ ...f, date: e.target.value }))} /></FLabel>
            <FLabel label="Author"><input className={inp} value={hseqForm.author ?? ''} onChange={e => setHseqForm(f => ({ ...f, author: e.target.value }))} /></FLabel>
          </div>
          <FLabel label="Description *"><textarea className={inp} rows={3} value={hseqForm.description ?? ''} onChange={e => setHseqForm(f => ({ ...f, description: e.target.value }))} /></FLabel>
          <FLabel label="Action Required"><textarea className={inp} rows={2} value={hseqForm.actionRequired ?? ''} onChange={e => setHseqForm(f => ({ ...f, actionRequired: e.target.value }))} /></FLabel>
        </Modal>
      )}
      {hseqDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteHseqRecord(hseqDel).then(() => setHseqDel(null)), reloadHseq)} onCancel={() => setHseqDel(null)} deleting={deleting} />}

      {attDel && <ConfirmDelete onConfirm={() => runDelete(() => deleteAttachment('Equipments', equipment.id, attDel).then(() => setAttDel(null)), reloadAtt)} onCancel={() => setAttDel(null)} deleting={deleting} />}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, false); e.target.value = ''; }} />
      <input ref={manualFileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, true); e.target.value = ''; }} />

      {/* ── Header ── */}
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#CBD5E1' }}>Equipment</span>
          <ChevronRight size={11} color="#D1D5DB" />
          {equipment.parentName && <><span style={{ fontSize: 11, color: '#CBD5E1' }}>{equipment.parentName}</span><ChevronRight size={11} color="#D1D5DB" /></>}
          <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>#{equipment.code}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: PRIMARY_DIM, border: `1.5px solid ${PRIMARY_BORDER}`, borderRadius: 10, padding: '5px 12px', fontFamily: 'monospace', fontWeight: 800, fontSize: 12, color: PRIMARY, flexShrink: 0 }}>
              #{equipment.code}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{equipment.name}</h2>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                {[equipment.maker, equipment.model, equipment.serial].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {isAdmin && (
              <button className="glass-btn-primary" onClick={() => { setJoEdit(null); setJoForm({ priority: 'Medium', status: 'Not Started' }); setJoModal(true); }}>
                <Wrench size={13} />+ Job Order
              </button>
            )}
            <button className="glass-btn-secondary" onClick={() => { setDefEdit(null); setDefForm({ severity: 'Medium', status: 'Open' }); setDefModal(true); }}>
              <AlertTriangle size={13} />Report Defect
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {equipment.criticality && <CriticalityBadge criticality={equipment.criticality} />}
          {equipment.status && <StatusBadge status={equipment.status} size="md" />}
          {equipment.department && <span className="badge-chip" style={{ background: 'rgba(99,102,241,0.1)', color: '#4338CA', border: '1px solid rgba(99,102,241,0.2)' }}>{equipment.department}</span>}
          {equipment.location && <span className="badge-chip" style={{ background: 'rgba(15,23,42,0.06)', color: '#475569', border: '1px solid rgba(0,0,0,0.09)' }}>{equipment.location}</span>}
          {equipment.runningHours != null && (
            <span className="badge-chip" style={{ background: 'rgba(245,158,11,0.1)', color: '#B45309', border: '1px solid rgba(245,158,11,0.2)' }}>
              {equipment.runningHours.toLocaleString()} hrs
            </span>
          )}
        </div>
      </div>

      {/* ── Body: left nav + content ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left nav */}
        <div style={{ width: 190, minWidth: 190, borderRight: '1px solid rgba(0,0,0,0.07)', background: 'rgba(248,250,252,0.8)', display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: 2, overflowY: 'auto' }}>
          <NavItem label="General" icon={Settings} active={mainTab === 'general'} onClick={() => setMainTab('general')} />
          <NavItem label="Job Plan" icon={ClipboardList} active={mainTab === 'jobplans'} onClick={() => setMainTab('jobplans')} count={jobPlans.length} />
          <NavItem label="Spare Parts" icon={Package} active={mainTab === 'spares'} onClick={() => setMainTab('spares')} count={spares.length} />
          <NavItem label="Job Orders" icon={Wrench} active={mainTab === 'joborders'} onClick={() => setMainTab('joborders')} count={jobOrders.length} />
          <NavItem label="Defects" icon={AlertCircle} active={mainTab === 'service_letter'} onClick={() => { setMainTab('service_letter'); }} count={defects.length} danger={defects.some(d => d.status === 'Open')} />
          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '6px 4px' }} />
          <NavItem label="Service Letter" icon={FileText} active={false} onClick={() => {}} />
          <NavItem label="QDMS" icon={BookOpen} active={false} onClick={() => {}} />
          <NavItem label="Purchase History" icon={ShoppingCart} active={false} onClick={() => {}} />
          <NavItem label="Mount/Dismount" icon={MoveVertical} active={false} onClick={() => {}} />
        </div>

        {/* Right content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ── GENERAL TAB ── */}
          {(mainTab === 'general') && (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              {/* Sub-tab bar */}
              <div style={{ display: 'flex', gap: 2, padding: '8px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(248,250,252,0.6)', flexShrink: 0, overflowX: 'auto' }}>
                {([
                  { id: 'basic', label: 'Basic Details' },
                  { id: 'spec', label: 'Specification', count: specs.length },
                  { id: 'attachments', label: 'Attachments', count: generalAttachments.length },
                  { id: 'manual', label: 'User Manual', count: manualAttachments.length },
                  { id: 'survey', label: 'Survey', count: surveys.length },
                  { id: 'coc', label: 'Condition Of Class', count: cocs.length },
                  { id: 'memo', label: 'Memoranda', count: memos.length },
                  { id: 'hseq', label: 'HSEQ', count: hseqRecords.length },
                ] as { id: GenTab; label: string; count?: number }[]).map(t => (
                  <button key={t.id} className={`sub-tab ${genTab === t.id ? 'active' : ''}`} onClick={() => setGenTab(t.id)}>
                    {t.label}
                    {t.count !== undefined && t.count > 0 && (
                      <span style={{ fontSize: 10, background: genTab === t.id ? PRIMARY_DIM : 'rgba(0,0,0,0.07)', color: genTab === t.id ? PRIMARY : '#6B7280', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>{t.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sub-tab content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

                {genTab === 'basic' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px 28px', marginBottom: 20 }}>
                      <Field label="Equipment Code" value={equipment.code ? `#${equipment.code}` : equipment.crmCode} />
                      <Field label="Equipment Name" value={equipment.name} />
                      <Field label="Class Reference" value={equipment.classRef} />
                      <Field label="Parent Equipment" value={equipment.parentName} />
                      <Field label="Safety Level" value={equipment.safetyLevel} />
                      <Field label="Equipment Status" value={equipment.status} />
                      <Field label="Maker" value={equipment.maker} />
                      <Field label="Model" value={equipment.model} />
                      <Field label="Equipment Type" value={equipment.type} />
                      <Field label="Serial Number" value={equipment.serial} />
                      <Field label="Builder / Licence" value={equipment.builderLicence} />
                      <Field label="Drawing Number" value={equipment.drawingNumber ?? equipment.drawingRef} />
                      <Field label="Department" value={equipment.department} />
                      <Field label="Location" value={equipment.location} />
                      <Field label="Class Name" value={equipment.className} />
                      <Field label="Preferred Vendor" value={equipment.preferredVendor} />
                      <Field label="Current RHRS" value={equipment.runningHours != null ? `${equipment.runningHours.toLocaleString()} hrs` : undefined} />
                      <Field label="Installation Date" value={equipment.installDate} />
                      <Field label="ID Number" value={equipment.idNumber} />
                      <Field label="Part Number" value={equipment.partNumber} />
                      <Field label="IMO Tier" value={equipment.imoTier} />
                      <Field label="Responsible Rank" value={equipment.responsibleRank} />
                      <Field label="Last Maintenance" value={equipment.lastMaintenance} />
                      <Field label="Next Due Date" value={equipment.nextDue} />
                      <Field label="Equipment Dimension" value={equipment.equipmentDimension} />
                      <Field label="Equipment Material" value={equipment.equipmentMaterial} />
                      <Field label="CRM Record Code" value={equipment.crmCode} />
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.025)', borderRadius: 12, padding: '14px 18px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Equipment Flags</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px 16px' }}>
                        {[
                          { label: 'Alarm', value: equipment.isAlarm },
                          { label: 'Main Engine', value: equipment.isMainEngine },
                          { label: 'Circulating', value: equipment.isCirculating },
                          { label: 'Mount Allowed', value: equipment.mountAllowed },
                          { label: 'RHRS Separately', value: equipment.rhrsSeparately },
                          { label: 'MD Required', value: equipment.mdRequired },
                        ].map(f => (
                          <div key={f.label}>
                            <dt style={{ fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{f.label}</dt>
                            <dd style={{ fontSize: 13, fontWeight: 700, color: f.value ? '#059669' : '#6B7280' }}>{f.value ? 'Yes' : 'No'}</dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {genTab === 'spec' && (
                  <GlassTable
                    action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setSpecForm({}); setSpecModal(true); }}><Plus size={13} />Add Specification</button> : undefined}
                    headers={['Category', 'Specification', 'Value', 'Unit', '']}
                    empty={!specsLoading && specs.length === 0}
                    emptyText="No specifications added yet."
                    loading={specsLoading}
                  >
                    {specs.map(s => (
                      <tr key={s.id} className="glass-row">
                        <td style={{ ...td, color: '#6B7280', fontSize: 11 }}>{s.category || '—'}</td>
                        <td style={{ ...td, fontWeight: 500 }}>{s.specName}</td>
                        <td style={{ ...td, fontWeight: 700, color: PRIMARY }}>{s.specValue}</td>
                        <td style={{ ...td, color: '#6B7280' }}>{s.unit || '—'}</td>
                        <td>
                          {isAdmin && <button onClick={() => setSpecDel(s.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                        </td>
                      </tr>
                    ))}
                  </GlassTable>
                )}

                {(genTab === 'attachments' || genTab === 'manual') && (() => {
                  const isManual = genTab === 'manual';
                  const list = isManual ? manualAttachments : generalAttachments;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="glass-btn-primary" disabled={uploading} onClick={() => isManual ? manualFileInputRef.current?.click() : fileInputRef.current?.click()}>
                          {uploading ? <Loader size={13} className="animate-spin" /> : <Upload size={13} />}
                          {isManual ? 'Upload Manual' : 'Upload File'}
                        </button>
                      </div>
                      {attLoading ? (
                        <div style={{ textAlign: 'center', color: '#94A3B8', padding: 32, fontSize: 13 }}>Loading attachments…</div>
                      ) : list.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94A3B8', padding: 32, fontSize: 13 }}>
                          <Paperclip size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                          No {isManual ? 'user manuals' : 'attachments'} uploaded yet.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {list.map(att => (
                            <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'white', borderRadius: 10, border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                              <div style={{ width: 36, height: 36, borderRadius: 8, background: isManual ? 'rgba(99,102,241,0.1)' : 'rgba(15,118,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {isManual ? <BookOpen size={16} color="#4F46E5" /> : <Paperclip size={16} color="#0F766E" />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', truncate: true } as React.CSSProperties}>{att.fileName}</div>
                                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                                  {formatFileSize(att.size)} · {att.createdTime ? new Date(att.createdTime).toLocaleDateString() : ''}
                                  {att.description && <> · {att.description}</>}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <a href={getAttachmentDownloadUrl('Equipments', equipment.id, att.id)} target="_blank" rel="noopener noreferrer" style={{ padding: 6, borderRadius: 6, color: '#64748B', display: 'flex', alignItems: 'center' }} title="Download">
                                  <Download size={13} />
                                </a>
                                {isAdmin && (
                                  <button onClick={() => setAttDel(att.id)} style={{ padding: 6, borderRadius: 6, color: '#CBD5E1', border: 'none', background: 'transparent', cursor: 'pointer' }} className="hover:bg-red-50 hover:text-red-500" title="Delete">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {genTab === 'survey' && (
                  <GlassTable
                    action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setSurveyForm({}); setSurveyModal(true); }}><Plus size={13} />Add Survey</button> : undefined}
                    headers={['Survey Type', 'Survey Date', 'Due Date', 'Certificate', 'Status', 'Surveyor', 'Society', '']}
                    empty={!surveysLoading && surveys.length === 0}
                    emptyText="No survey records added yet."
                    loading={surveysLoading}
                  >
                    {surveys.map(s => {
                      const expired = s.status === 'Expired' || s.status === 'Overdue';
                      const valid = s.status === 'Valid' || s.status === 'Completed';
                      const statusColor = expired ? '#DC2626' : valid ? '#059669' : '#D97706';
                      const statusBg = expired ? 'rgba(239,68,68,0.1)' : valid ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)';
                      return (
                        <tr key={s.id} className="glass-row">
                          <td style={{ ...td, fontWeight: 600 }}>{s.surveyType}</td>
                          <td style={td}>{s.surveyDate || '—'}</td>
                          <td style={{ ...td, fontWeight: 600, color: expired ? '#DC2626' : '#374151' }}>{s.dueDate || '—'}</td>
                          <td style={tdMono}>{s.certificateNumber || '—'}</td>
                          <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: statusBg, color: statusColor, border: `1px solid ${statusColor}30` }}>{s.status}</span></td>
                          <td style={td}>{s.surveyor || '—'}</td>
                          <td style={td}>{s.classificationSociety || '—'}</td>
                          <td>
                            {isAdmin && <button onClick={() => setSurveyDel(s.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                          </td>
                        </tr>
                      );
                    })}
                  </GlassTable>
                )}

                {genTab === 'coc' && (
                  <GlassTable
                    action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setCocForm({}); setCocModal(true); }}><Plus size={13} />Add COC</button> : undefined}
                    headers={['COC Number', 'Description', 'Issued', 'Due Date', 'Status', '']}
                    empty={!cocsLoading && cocs.length === 0}
                    emptyText="No conditions of class recorded."
                    loading={cocsLoading}
                  >
                    {cocs.map(c => {
                      const isOpen = c.status === 'Open';
                      return (
                        <tr key={c.id} className="glass-row">
                          <td style={tdMono}>{c.cocNumber}</td>
                          <td style={{ ...td, maxWidth: 280 }}>{c.description}</td>
                          <td style={td}>{c.issuedDate || '—'}</td>
                          <td style={{ ...td, fontWeight: 600, color: isOpen ? '#D97706' : '#374151' }}>{c.dueDate || '—'}</td>
                          <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: isOpen ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: isOpen ? '#D97706' : '#059669', border: `1px solid ${isOpen ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{c.status}</span></td>
                          <td>
                            {isAdmin && <button onClick={() => setCocDel(c.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                          </td>
                        </tr>
                      );
                    })}
                  </GlassTable>
                )}

                {genTab === 'memo' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="glass-btn-primary" onClick={() => { setMemoForm({}); setMemoModal(true); }}><Plus size={13} />Add Memorandum</button>
                      </div>
                    )}
                    {memosLoading ? (
                      <div style={{ textAlign: 'center', color: '#94A3B8', padding: 32, fontSize: 13 }}>Loading…</div>
                    ) : memos.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94A3B8', padding: 32, fontSize: 13 }}>No memoranda recorded.</div>
                    ) : memos.map(m => {
                      const priorityColor: Record<string, string> = { High: '#DC2626', Medium: '#D97706', Low: '#059669', Info: '#4F46E5' };
                      const pc = priorityColor[m.priority] ?? '#6B7280';
                      return (
                        <div key={m.id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: '#1C1C1E' }}>{m.subject}</div>
                              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{m.author} · {m.memoDate}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${pc}15`, color: pc, border: `1px solid ${pc}30` }}>{m.priority}</span>
                              {isAdmin && <button onClick={() => setMemoDel(m.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                            </div>
                          </div>
                          <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {genTab === 'hseq' && (
                  <GlassTable
                    action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setHseqForm({}); setHseqModal(true); }}><Plus size={13} />Add HSEQ Record</button> : undefined}
                    headers={['Type', 'Title', 'Date', 'Author', 'Status', '']}
                    empty={!hseqLoading && hseqRecords.length === 0}
                    emptyText="No HSEQ records for this equipment."
                    loading={hseqLoading}
                  >
                    {hseqRecords.map(h => {
                      const open = h.status === 'Open' || h.status === 'Action Required';
                      return (
                        <tr key={h.id} className="glass-row">
                          <td><span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(79,70,230,0.08)', color: '#4F46E5', border: '1px solid rgba(79,70,230,0.15)' }}>{h.recordType}</span></td>
                          <td style={{ ...td, fontWeight: 600, maxWidth: 220 }}>{h.title}</td>
                          <td style={td}>{h.date || '—'}</td>
                          <td style={td}>{h.author || '—'}</td>
                          <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: open ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: open ? '#DC2626' : '#059669', border: `1px solid ${open ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{h.status}</span></td>
                          <td>
                            {isAdmin && <button onClick={() => setHseqDel(h.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                          </td>
                        </tr>
                      );
                    })}
                  </GlassTable>
                )}
              </div>
            </div>
          )}

          {/* ── DEFECTS TAB (mapped to service_letter nav item for visual) ── */}
          {mainTab === 'service_letter' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <GlassTable
                title="Defect Register"
                action={<button className="glass-btn-secondary" onClick={() => { setDefEdit(null); setDefForm({ severity: 'Medium', status: 'Open' }); setDefModal(true); }}><AlertTriangle size={13} />Report Defect</button>}
                headers={['Defect ID', 'Description', 'Severity', 'Reported By', 'Date', 'Status', '']}
                empty={defects.length === 0}
                emptyText="No defects recorded."
              >
                {defects.map(d => (
                  <tr key={d.id} className="glass-row">
                    <td style={tdMono}>{d.defectId}</td>
                    <td style={{ ...td, maxWidth: 220 }}>{d.description}</td>
                    <td><SeverityBadge severity={d.severity} /></td>
                    <td style={td}>{d.reportedBy || '—'}</td>
                    <td style={td}>{d.reportedDate || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setDefEdit(d.id); setDefForm(d); setDefModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                        <button onClick={() => setDefDel(d.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </GlassTable>
            </div>
          )}

          {/* ── JOB PLANS TAB ── */}
          {mainTab === 'jobplans' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <GlassTable
                title="Linked Maintenance Plans"
                action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setJpEdit(null); setJpForm({ interval: 90 }); setJpModal(true); }}><Plus size={13} />Add Job Plan</button> : undefined}
                headers={['Plan Code', 'Title', 'Frequency', 'Last Done', 'Next Due', 'Rank', '']}
                empty={jobPlans.length === 0}
                emptyText="No job plans linked."
              >
                {jobPlans.map(jp => (
                  <tr key={jp.id} className="glass-row">
                    <td style={tdMono}>{jp.code || '—'}</td>
                    <td style={{ ...td, maxWidth: 200, fontWeight: 500 }}>{jp.title}</td>
                    <td style={td}>{Object.entries(FREQ_TO_DAYS).find(([, d]) => d === jp.interval)?.[0] ?? jp.interval}</td>
                    <td style={td}>{jp.lastDone || '—'}</td>
                    <td style={{ ...td, fontWeight: 600, color: jp.nextDue && new Date(jp.nextDue) < new Date() ? '#DC2626' : '#374151' }}>{jp.nextDue || '—'}</td>
                    <td style={td}>{jp.responsibleRank || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        {isAdmin && <button onClick={() => generateJO(jp)} disabled={generatingFor === jp.id} className="p-1 rounded hover:bg-emerald-50 text-slate-300 hover:text-emerald-600" title="Generate JO">{generatingFor === jp.id ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}</button>}
                        <button onClick={() => { setJpEdit(jp.id); setJpForm(jp); setJpModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                        {isAdmin && <button onClick={() => setJpDel(jp.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </GlassTable>
            </div>
          )}

          {/* ── JOB ORDERS TAB ── */}
          {mainTab === 'joborders' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <GlassTable
                title="Work Order History"
                action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setJoEdit(null); setJoForm({ priority: 'Medium', status: 'Not Started' }); setJoModal(true); }}><Plus size={13} />Create Job Order</button> : undefined}
                headers={['JO Number', 'Title', 'Priority', 'Assigned To', 'Due Date', 'Status', '']}
                empty={jobOrders.length === 0}
                emptyText="No job orders for this equipment."
              >
                {jobOrders.map(jo => (
                  <tr key={jo.id} className="glass-row">
                    <td style={tdMono}>{jo.joNumber}</td>
                    <td style={{ ...td, maxWidth: 200, fontWeight: 500 }}>{jo.title}</td>
                    <td><PriorityBadge priority={jo.priority} /></td>
                    <td style={td}>{jo.assignedTo || '—'}</td>
                    <td style={td}>{jo.dueDate || '—'}</td>
                    <td><StatusBadge status={jo.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setJoEdit(jo.id); setJoForm(jo); setJoModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                        {isAdmin && <button onClick={() => setJoDel(jo.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </GlassTable>
            </div>
          )}

          {/* ── SPARES TAB ── */}
          {mainTab === 'spares' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              <GlassTable
                title="Spare Parts"
                action={isAdmin ? <button className="glass-btn-primary" onClick={() => { setSpEdit(null); setSpForm({ qtyOnboard: 0, minStock: 0, unit: 'pcs' }); setSpModal(true); }}><Plus size={13} />Add Spare</button> : undefined}
                headers={['Part Number', 'Description', 'Maker', 'Qty', 'Min', 'Status', 'Location', '']}
                empty={spares.length === 0}
                emptyText="No spare parts linked."
              >
                {spares.map(sp => {
                  const outOfStock = sp.qtyOnboard === 0;
                  const low = !outOfStock && sp.qtyOnboard <= sp.minStock;
                  return (
                    <tr key={sp.id} className="glass-row">
                      <td style={tdMono}>{sp.partNumber}</td>
                      <td style={{ ...td, fontWeight: 500 }}>{sp.description}</td>
                      <td style={td}>{sp.maker || '—'}</td>
                      <td style={{ ...td, fontWeight: 700, fontSize: 14, color: outOfStock ? '#DC2626' : low ? '#D97706' : '#374151' }}>{sp.qtyOnboard}</td>
                      <td style={td}>{sp.minStock}</td>
                      <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: outOfStock ? 'rgba(239,68,68,0.1)' : low ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: outOfStock ? '#DC2626' : low ? '#D97706' : '#059669', border: `1px solid ${outOfStock ? 'rgba(239,68,68,0.2)' : low ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>{outOfStock ? 'Out of Stock' : low ? 'Low Stock' : 'OK'}</span></td>
                      <td style={td}>{sp.location || '—'}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSpEdit(sp.id); setSpForm(sp); setSpModal(true); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                          {isAdmin && <button onClick={() => setSpDel(sp.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><Trash2 size={12} /></button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </GlassTable>
            </div>
          )}

          {/* ── PLACEHOLDER TABS ── */}
          {(mainTab === 'qdms' || mainTab === 'purchase' || mainTab === 'mount') && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#CBD5E1' }}>
                <ClipboardCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8' }}>Coming Soon</p>
                <p style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>This section is under development.</p>
              </div>
            </div>
          )}
        </div>
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
        <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 240, margin: '0 auto', lineHeight: 1.6 }}>Select an item from the equipment tree to view details, specifications, surveys, job plans, and more.</p>
      </div>
    </div>
  );
}
