import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader, AlertCircle, X, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchVessels, createVessel, updateVessel, deleteVessel } from '../../services/crmService';
import type { Vessel } from '../../types';

const P = 'https://images.pexels.com/photos';
const Q = '?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
const vesselTypeImages: Record<string, string> = {
  'Cruise Ship':     `${P}/33270055/pexels-photo-33270055.jpeg${Q}`,
  'Bulk Carrier':    `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
  'Container Vessel':`${P}/9806482/pexels-photo-9806482.jpeg${Q}`,
  'General Cargo':   `${P}/36638041/pexels-photo-36638041.jpeg${Q}`,
  'Chemical Tanker': `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Tanker':          `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Product Tanker':  `${P}/10832142/pexels-photo-10832142.jpeg${Q}`,
  'LPG Carrier':     `${P}/1036866/pexels-photo-1036866.jpeg${Q}`,
  'OBO Carrier':     `${P}/19500302/pexels-photo-19500302.jpeg${Q}`,
  'Ro-Ro Vessel':    `${P}/37828492/pexels-photo-37828492.jpeg${Q}`,
  'default':         `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
};

const VESSEL_TYPES = [
  'Bulk Carrier', 'Container Vessel', 'Tanker', 'Product Tanker', 'Chemical Tanker',
  'LPG Carrier', 'General Cargo', 'Ro-Ro Vessel', 'OBO Carrier', 'Cruise Ship',
];
const VESSEL_STATUSES: { value: Vessel['vesselStatus']; label: string }[] = [
  { value: 'at_sea', label: 'At Sea' },
  { value: 'in_port', label: 'In Port' },
  { value: 'in_maintenance', label: 'In Maintenance' },
  { value: 'drydock', label: 'Drydock' },
];

const EMPTY: Partial<Vessel> = {
  name: '', imo: '', type: 'Bulk Carrier', flag: '', buildYear: new Date().getFullYear(),
  classSociety: '', grt: 0, dwt: 0, vesselStatus: 'at_sea',
};

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

function getVesselImage(type: string): string {
  return vesselTypeImages[type] ?? vesselTypeImages['default'];
}

function getVesselStatusColor(vs: string | undefined): { color: string; label: string } {
  switch (vs) {
    case 'at_sea': return { color: '#3b82f6', label: 'At Sea' };
    case 'in_port': return { color: '#22c55e', label: 'In Port' };
    case 'in_maintenance': return { color: '#f59e0b', label: 'Maintenance' };
    case 'drydock': return { color: '#94a3b8', label: 'Drydock' };
    default: return { color: '#94a3b8', label: 'Unknown' };
  }
}

export function VesselsPage() {
  const { currentRole } = useApp();
  const navigate = useNavigate();
  const { data: vessels, loading, error, reload } = useCrmFetch(fetchVessels);

  const [form, setForm] = useState<Partial<Vessel>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() { setForm(EMPTY); setEditId(null); setModalOpen(true); }
  function openEdit(v: Vessel) {
    setForm({ name: v.name, imo: v.imo, type: v.type, flag: v.flag, buildYear: v.buildYear, classSociety: v.classSociety, grt: v.grt, dwt: v.dwt, vesselStatus: v.vesselStatus });
    setEditId(v.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) await updateVessel(editId, form);
      else await createVessel(form);
      setModalOpen(false); reload();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteVessel(deleteId); setDeleteId(null); reload(); }
    finally { setDeleting(false); }
  }

  const set = (k: keyof Vessel) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === 'buildYear' || k === 'grt' || k === 'dwt' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="p-6 min-h-full w-full" style={{ background: '#f8fafc' }}>
      {modalOpen && (
        <Modal title={editId ? 'Edit Vessel' : 'Add Vessel'} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <Field label="Vessel Name *">
            <input className={inp} value={form.name ?? ''} onChange={set('name')} placeholder="e.g. MV Pacific Star" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="IMO Number">
              <input className={inp} value={form.imo ?? ''} onChange={set('imo')} placeholder="e.g. 9876543" />
            </Field>
            <Field label="Flag State">
              <input className={inp} value={form.flag ?? ''} onChange={set('flag')} placeholder="e.g. Panama" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Vessel Type *">
              <select className={inp} value={form.type ?? 'Bulk Carrier'} onChange={set('type')}>
                {VESSEL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Build Year">
              <input className={inp} type="number" min={1900} max={2100} value={form.buildYear ?? ''} onChange={set('buildYear')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="GRT (Gross Tonnage)">
              <input className={inp} type="number" min={0} value={form.grt ?? 0} onChange={set('grt')} />
            </Field>
            <Field label="DWT (Deadweight Tonnage)">
              <input className={inp} type="number" min={0} value={form.dwt ?? 0} onChange={set('dwt')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Classification Society">
              <input className={inp} value={form.classSociety ?? ''} onChange={set('classSociety')} placeholder="e.g. Lloyd's Register" />
            </Field>
            <Field label="Vessel Status">
              <select className={inp} value={form.vesselStatus ?? 'at_sea'} onChange={set('vesselStatus')}>
                {VESSEL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete Vessel?</p>
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vessel Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${vessels.length} vessels managed`}
          </p>
        </div>
        {currentRole === 'admin' && (
          <button className="btn-primary" onClick={openCreate}><Plus size={16} />Add Vessel</button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
          <Loader size={20} className="animate-spin" /> Loading vessels from Zoho CRM…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {!loading && !error && vessels.length === 0 && (
        <div className="text-center py-24 text-slate-400">
          No vessels found in Zoho CRM. Add your first vessel.
        </div>
      )}

      {!loading && vessels.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {vessels.map(v => {
            const imgSrc = (v as Vessel & { imageUrl?: string }).imageUrl || getVesselImage(v.type);
            const { color, label } = getVesselStatusColor(v.vesselStatus);
            return (
              <div
                key={v.id}
                className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group"
                style={{ borderRadius: 16, height: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                onClick={() => navigate(`/vessels/${v.id}`)}
              >
                <img
                  src={imgSrc}
                  alt={v.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}></div>
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${color}33`, border: `1px solid ${color}66`, fontSize: 11, color, fontWeight: 600 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}></div>
                    {label}
                  </div>
                </div>
                {currentRole === 'admin' && (
                  <div
                    className="absolute top-10 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(v)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 shadow-sm"
                      title="Edit vessel"
                    ><Pencil size={13} /></button>
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-red-50 text-slate-600 hover:text-red-600 shadow-sm"
                      title="Delete vessel"
                    ><Trash2 size={13} /></button>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{v.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{v.type}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 }}>
                    {v.imo ? `IMO ${v.imo} · ` : ''}{v.flag}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
