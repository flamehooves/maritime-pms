import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, Loader, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchSpareParts, createSparePart, updateSparePart, deleteSparePart } from '../../services/crmService';
import type { SparePart } from '../../types';

const UNITS = ['pcs', 'sets', 'litres', 'kg', 'meters', 'rolls', 'pairs', 'boxes'];
const EMPTY: Partial<SparePart> = { partNumber: '', description: '', maker: '', qtyOnboard: 0, minStock: 0, unit: 'pcs', location: '' };

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

export function SparesPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('All');
  const [form, setForm] = useState<Partial<SparePart>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: spareParts, loading, error, reload } = useCrmFetch(
    () => fetchSpareParts(currentVesselId), [currentVesselId]
  );

  const lowStock = spareParts.filter(sp => sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0);
  const outOfStock = spareParts.filter(sp => sp.qtyOnboard === 0);

  const filtered = spareParts.filter(sp => {
    const matchSearch = !search ||
      sp.description.toLowerCase().includes(search.toLowerCase()) ||
      sp.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchStock =
      stockFilter === 'All' ||
      (stockFilter === 'Low' && sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0) ||
      (stockFilter === 'Out' && sp.qtyOnboard === 0) ||
      (stockFilter === 'Critical' && sp.isCritical);
    return matchSearch && matchStock;
  });

  function openCreate() { setForm(EMPTY); setEditId(null); setModalOpen(true); }
  function openEdit(sp: SparePart) {
    setForm({ partNumber: sp.partNumber, description: sp.description, maker: sp.maker, qtyOnboard: sp.qtyOnboard, minStock: sp.minStock, unit: sp.unit, location: sp.location });
    setEditId(sp.id); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId) await updateSparePart(editId, { qtyOnboard: form.qtyOnboard, location: form.location });
      else await createSparePart(form, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModalOpen(false); reload();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteSparePart(deleteId); setDeleteId(null); reload(); }
    finally { setDeleting(false); }
  }

  const set = (k: keyof SparePart) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: k === 'qtyOnboard' || k === 'minStock' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="p-6 min-h-full w-full">
      {modalOpen && (
        <Modal title={editId ? 'Edit Spare Part' : 'Add Spare Part'} onClose={() => setModalOpen(false)} onSave={handleSave} saving={saving}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Part Number *">
              <input className={inp} value={form.partNumber ?? ''} onChange={set('partNumber')} placeholder="e.g. MAN-4570-012" disabled={!!editId} />
            </Field>
            <Field label="Maker">
              <input className={inp} value={form.maker ?? ''} onChange={set('maker')} placeholder="e.g. MAN B&W" disabled={!!editId} />
            </Field>
          </div>
          <Field label="Description *">
            <input className={inp} value={form.description ?? ''} onChange={set('description')} placeholder="e.g. Exhaust Valve Spindle" disabled={!!editId} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Qty on Board *">
              <input className={inp} type="number" min={0} value={form.qtyOnboard ?? 0} onChange={set('qtyOnboard')} />
            </Field>
            <Field label="Min Stock">
              <input className={inp} type="number" min={0} value={form.minStock ?? 0} onChange={set('minStock')} disabled={!!editId} />
            </Field>
            <Field label="Unit">
              <select className={inp} value={form.unit ?? 'pcs'} onChange={set('unit')} disabled={!!editId}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Storage Location">
            <input className={inp} value={form.location ?? ''} onChange={set('location')} placeholder="e.g. E.R. Store, Rack A3" />
          </Field>
        </Modal>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete Spare Part?</p>
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
          <h1 className="text-xl font-bold text-slate-900">Spare Parts Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Loading…' : `${spareParts.length} spare parts tracked`}</p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary" onClick={openCreate}><Plus size={16} />Add Part</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><Package size={14} className="text-slate-500" /><span className="text-xs text-slate-500">Total Parts</span></div>
          <div className="text-xl font-bold text-slate-900 mt-1">{spareParts.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-red-100 p-3" style={{ background: '#FFF5F5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /><span className="text-xs text-red-600">Critical Spares</span></div>
          <div className="text-xl font-bold text-red-700 mt-1">{spareParts.filter(s => s.isCritical).length}</div>
        </div>
        <div className="bg-white rounded-lg border border-amber-100 p-3" style={{ background: '#fffbeb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /><span className="text-xs text-amber-600">Low Stock</span></div>
          <div className="text-xl font-bold text-amber-700 mt-1">{lowStock.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs text-red-600">Out of Stock</div>
          <div className="text-xl font-bold text-red-700 mt-1">{outOfStock.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search parts..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          {['All', 'Low', 'Out', 'Critical'].map(f => (
            <button key={f} onClick={() => setStockFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stockFilter === f ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f === 'Out' ? 'Out of Stock' : f === 'Critical' ? 'Critical Only' : f === 'Low' ? 'Low Stock' : 'All'}
            </button>
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
              <tr><th>Part Number</th><th>Description</th><th>Equipment</th><th>Maker</th><th>Qty</th><th>Min</th><th>Stock Status</th><th>Location</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(sp => {
                const outOfStk = sp.qtyOnboard === 0;
                const low = sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0;
                return (
                  <tr key={sp.id}>
                    <td className="text-xs font-mono text-slate-600">{sp.partNumber || '—'}</td>
                    <td className="text-xs font-medium text-slate-800 max-w-xs">{sp.description}</td>
                    <td className="text-xs text-slate-600 truncate max-w-32">{sp.equipmentName || '—'}</td>
                    <td className="text-xs text-slate-600">{sp.maker || '—'}</td>
                    <td className={`text-sm font-bold ${outOfStk ? 'text-red-600' : low ? 'text-amber-600' : 'text-slate-700'}`}>{sp.qtyOnboard}</td>
                    <td className="text-xs text-slate-600">{sp.minStock}</td>
                    <td>
                      <span className={`badge ${outOfStk ? 'bg-red-100 text-red-700 border border-red-200' : low ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {outOfStk ? 'Out of Stock' : low ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{sp.location || '—'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(sp)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Edit stock / location"><Pencil size={13} /></button>
                        {currentRole !== 'technician' && (
                          <button onClick={() => setDeleteId(sp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No spare parts found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {spareParts.length} parts
        </div>
      </div>
    </div>
  );
}
