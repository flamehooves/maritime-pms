import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { useCrmFetch } from '../../hooks/useCrmFetch';

export interface ColDef {
  key: string;
  label: string;
  width?: string;
  render?: (val: unknown, row: Record<string, unknown>) => React.ReactNode;
}

export interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'select' | 'email' | 'number';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  columns: ColDef[];
  fields: FieldDef[];
  emptyDefault: Record<string, unknown>;
  fetchFn: () => Promise<Record<string, unknown>[]>;
  createFn: (p: Record<string, unknown>) => Promise<unknown>;
  updateFn: (id: string, p: Record<string, unknown>) => Promise<unknown>;
  deleteFn: (id: string) => Promise<unknown>;
  searchKeys?: string[];
  readOnly?: boolean;
}

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white';

function StatusBadge({ val }: { val: unknown }) {
  const active = String(val) === 'Active';
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: active ? '#059669' : '#64748b' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {String(val ?? 'Active')}
    </span>
  );
}

export function MdmTable({ title, subtitle, columns, fields, emptyDefault, fetchFn, createFn, updateFn, deleteFn, searchKeys = ['Name'], readOnly = false }: Props) {
  const { data, loading, error, reload } = useCrmFetch(fetchFn);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Record<string, unknown>>(emptyDefault);
  const [editId, setEditId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = data.filter(row =>
    !search || searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  function openCreate() {
    setForm({ ...emptyDefault });
    setEditId(null);
    setSaveError(null);
    setModalOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    const f: Record<string, unknown> = {};
    fields.forEach(fd => { f[fd.key] = row[fd.key] ?? ''; });
    setForm(f);
    setEditId(String(row.id));
    setSaveError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      if (editId) await updateFn(editId, form);
      else await createFn(form);
      setModalOpen(false);
      reload();
    } catch (e) {
      setSaveError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteFn(deleteId);
      setDeleteId(null);
      reload();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">{editId ? `Edit ${title}` : `Add ${title}`}</h2>
              <button onClick={() => setModalOpen(false)}><X size={16} className="text-slate-400" /></button>
            </div>
            <div className="overflow-y-auto p-6 flex flex-col gap-4">
              {saveError && <div className="p-3 rounded-xl text-xs text-red-700 bg-red-50 border border-red-100">{saveError}</div>}
              {fields.map(fd => (
                <div key={fd.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {fd.label}{fd.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {fd.type === 'select' && fd.options ? (
                    <select className={inp} value={String(form[fd.key] ?? '')} onChange={e => setForm(f => ({ ...f, [fd.key]: e.target.value }))}>
                      <option value="">Select…</option>
                      {fd.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : fd.type === 'textarea' ? (
                    <textarea className={inp} rows={3} value={String(form[fd.key] ?? '')} placeholder={fd.placeholder} onChange={e => setForm(f => ({ ...f, [fd.key]: e.target.value }))} />
                  ) : (
                    <input className={inp} type={fd.type ?? 'text'} value={String(form[fd.key] ?? '')} placeholder={fd.placeholder} onChange={e => setForm(f => ({ ...f, [fd.key]: fd.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2" style={{ background: '#4f46e6' }}>
                {saving && <Loader size={13} className="animate-spin" />}Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <Trash2 size={28} className="text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-900 mb-1">Delete this record?</p>
            <p className="text-xs text-slate-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader size={12} className="animate-spin" />}Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {!readOnly && (
          <button onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all" style={{ background: '#4f46e6' }}>
            <Plus size={14} />Add
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <AlertCircle size={16} /> {error}
          <button onClick={reload} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex-1" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    {columns.map(c => <th key={c.key} style={c.width ? { width: c.width } : {}}>{c.label}</th>)}
                    {!readOnly && <th style={{ width: 80 }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <tr key={String(row.id)}>
                      {columns.map(c => (
                        <td key={c.key}>
                          {c.render ? c.render(row[c.key], row) : c.key === 'Status' ? <StatusBadge val={row[c.key]} /> : <span className="text-slate-700">{String(row[c.key] ?? '—')}</span>}
                        </td>
                      ))}
                      {!readOnly && (
                        <td>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors" title="Edit"><Pencil size={13} /></button>
                            <button onClick={() => setDeleteId(String(row.id))} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
