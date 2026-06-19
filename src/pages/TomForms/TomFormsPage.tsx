import React, { useState } from 'react';
import { ClipboardCheck, Plus, X, Loader, AlertTriangle, Check, Pencil } from 'lucide-react';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchTomForms, createTomForm, updateTomForm, deleteTomForm } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import type { TomForm } from '../../types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES = ['Safety','Machinery','Electrical','Navigation','Deck','Hull','Environmental','General'];
const RANKS = ['Chief Engineer','Chief Officer','1st Engineer','2nd Engineer','3rd Engineer','Electrician','Bosun','Motorman'];
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>{children}</div>;
}

function WeekCell({ done, date }: { done: boolean; date?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.04)', border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.08)'}` }}>
        {done ? <Check size={14} color="#059669" strokeWidth={3} /> : <span style={{ fontSize: 10, color: '#CBD5E1' }}>—</span>}
      </div>
      {date && <span style={{ fontSize: 9, color: '#94A3B8' }}>{date.slice(5)}</span>}
    </div>
  );
}

export function TomFormsPage() {
  const { currentVesselId } = useApp();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [catFilter, setCatFilter] = useState('All');

  const { data: forms, loading, reload } = useCrmFetch(
    () => fetchTomForms(currentVesselId, month, year),
    [currentVesselId, month, year]
  );

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<TomForm>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const filtered = catFilter === 'All' ? forms : forms.filter(f => f.category === catFilter);

  // Completion stats
  const weeks = [1, 2, 3, 4] as const;
  const completionByWeek = weeks.map(w => {
    const total = forms.length;
    const done = forms.filter(f => f[`w${w}Completed` as keyof TomForm]).length;
    return { w, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  async function handleSave() {
    if (!form.name) { setSaveErr('Form name is required.'); return; }
    setSaving(true); setSaveErr(null);
    try {
      if (modal === 'edit' && editId) await updateTomForm(editId, form);
      else await createTomForm({ ...form, month, year, weekNumber: 1 }, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModal(null); reload();
    } catch (e) { setSaveErr(String(e)); } finally { setSaving(false); }
  }

  async function handleToggleWeek(f: TomForm, w: 1 | 2 | 3 | 4) {
    const key = `w${w}Completed` as keyof TomForm;
    const dateKey = `w${w}Date` as keyof TomForm;
    const newVal = !f[key];
    await updateTomForm(f.id, {
      [`w${w}Completed`]: newVal,
      [`w${w}Date`]: newVal ? new Date().toISOString().split('T')[0] : undefined,
    } as Partial<TomForm>);
    reload();
  }

  async function handleDelete(id: string) {
    await deleteTomForm(id);
    reload();
  }

  const td: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '9px 14px', verticalAlign: 'middle' };

  return (
    <div style={{ padding: 24, minHeight: '100%', background: '#F8FAFC' }}>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-bold text-slate-900">{modal === 'edit' ? 'Edit TOM Form' : 'Add TOM Form'}</h2>
              <button onClick={() => { setModal(null); setSaveErr(null); }}><X size={15} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {saveErr && <div className="flex gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{saveErr}</div>}
              <FLabel label="Form Name *"><input className={inp} value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Fire & Emergency Drill Checklist" /></FLabel>
              <div className="grid grid-cols-2 gap-3">
                <FLabel label="Category">
                  <select className={inp} value={form.category ?? ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </FLabel>
                <FLabel label="Responsible Rank">
                  <select className={inp} value={form.responsibleRank ?? ''} onChange={e => setForm(f => ({ ...f, responsibleRank: e.target.value }))}>
                    <option value="">Select…</option>
                    {RANKS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </FLabel>
              </div>
              {modal === 'edit' && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Weekly Completion</div>
                  <div className="grid grid-cols-4 gap-2">
                    {([1,2,3,4] as const).map(w => (
                      <div key={w} className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-500">W{w}</label>
                        <input type="checkbox" checked={!!(form as Record<string,unknown>)[`w${w}Completed`]} onChange={e => setForm(f => ({ ...f, [`w${w}Completed`]: e.target.checked }))} className="w-4 h-4" />
                        <input type="date" className="text-xs border border-slate-200 rounded p-1" value={(form as Record<string,unknown>)[`w${w}Date`] as string ?? ''} onChange={e => setForm(f => ({ ...f, [`w${w}Date`]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <FLabel label="Remarks"><textarea className={inp} rows={2} value={form.remarks ?? ''} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} /></FLabel>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5" style={{ background: '#4f46e6' }}>
                {saving && <Loader size={12} className="animate-spin" />}Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(79,70,230,0.1)', border: '1px solid rgba(79,70,230,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardCheck size={15} color="#4f46e6" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>TOM Forms</h1>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 42 }}>Technical & Operational Maintenance form completion tracking</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #4f46e6, #3730a3)', boxShadow: '0 2px 8px rgba(79,70,230,0.35)' }}
          onClick={() => { setForm({ month, year }); setEditId(null); setModal('add'); }}>
          <Plus size={14} />Add Form
        </button>
      </div>

      {/* Month/Year selector + Week completion tiles */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fff', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ fontSize: 12, border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: '#374151' }}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ fontSize: 12, border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: '#374151' }}>
            {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        {completionByWeek.map(({ w, done, total, pct }) => (
          <div key={w} style={{ background: '#fff', borderRadius: 12, padding: '10px 16px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', minWidth: 100 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Week {w}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: pct === 100 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626' }}>{pct}%</div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{done}/{total} forms</div>
            <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct === 100 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626', transition: 'width 0.3s' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden', width: 'fit-content', marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: catFilter === c ? 700 : 500, background: catFilter === c ? '#4f46e6' : 'transparent', color: catFilter === c ? '#fff' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.12s' }}>{c}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40, color: '#94A3B8', fontSize: 13 }}>
            <Loader size={16} className="animate-spin" />Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <ClipboardCheck size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>No forms for {MONTHS[month - 1]} {year}</p>
            <p style={{ fontSize: 12, color: '#CBD5E1', marginTop: 4 }}>Add forms to start tracking monthly completion.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {['Form Name', 'Category', 'Responsible Rank', 'W1', 'W2', 'W3', 'W4', 'Completion', ''].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const done = [f.w1Completed, f.w2Completed, f.w3Completed, f.w4Completed].filter(Boolean).length;
                const pct = Math.round((done / 4) * 100);
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ ...td, fontWeight: 600, maxWidth: 220 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span></td>
                    <td style={td}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(79,70,230,0.08)', color: '#4f46e6', border: '1px solid rgba(79,70,230,0.15)' }}>{f.category}</span>
                    </td>
                    <td style={{ ...td, color: '#64748B' }}>{f.responsibleRank || '—'}</td>
                    {([1, 2, 3, 4] as const).map(w => (
                      <td key={w} style={{ padding: '8px 14px', verticalAlign: 'middle', cursor: 'pointer' }} onClick={() => handleToggleWeek(f, w)}>
                        <WeekCell done={f[`w${w}Completed` as keyof TomForm] as boolean} date={f[`w${w}Date` as keyof TomForm] as string | undefined} />
                      </td>
                    ))}
                    <td style={{ padding: '8px 14px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.06)', minWidth: 50 }}>
                          <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: pct === 100 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626' }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', minWidth: 28 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '0 10px' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button onClick={() => { setEditId(f.id); setForm(f); setModal('edit'); }} className="p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600"><Pencil size={12} /></button>
                        <button onClick={() => handleDelete(f.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500"><X size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
