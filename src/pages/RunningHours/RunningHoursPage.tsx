import React, { useState } from 'react';
import { Gauge, Plus, X, Loader, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchRunningHoursLog, createRunningHoursEntry, fetchEquipments } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import type { RunningHoursLog } from '../../types';

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

function FLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>{children}</div>;
}

export function RunningHoursPage() {
  const { currentVesselId } = useApp();

  const { data: logs, loading: logsLoading, reload } = useCrmFetch(() => fetchRunningHoursLog(currentVesselId), [currentVesselId]);
  const { data: equipments, loading: eqLoading } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<RunningHoursLog>>({ logDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loading = logsLoading || eqLoading;

  // Latest reading per equipment
  const latestByEquip: Record<string, RunningHoursLog> = {};
  for (const log of logs) {
    if (!log.equipmentId) continue;
    const existing = latestByEquip[log.equipmentId];
    if (!existing || (log.logDate ?? '') > (existing.logDate ?? '')) {
      latestByEquip[log.equipmentId] = log;
    }
  }

  const allEquipment = equipments.filter(e => !e.isGroup);

  async function handleSave() {
    if (!form.equipmentId || !form.runningHoursReading) { setSaveError('Equipment and running hours reading are required.'); return; }
    setSaving(true); setSaveError(null);
    try {
      const eq = equipments.find(e => e.id === form.equipmentId);
      await createRunningHoursEntry({ ...form, name: `RHL-${eq?.name ?? 'EQ'}-${form.logDate}` }, currentVesselId !== '__all__' ? currentVesselId : undefined);
      setModal(false);
      setForm({ logDate: new Date().toISOString().split('T')[0] });
      reload();
    } catch (e) { setSaveError(String(e)); } finally { setSaving(false); }
  }

  return (
    <div style={{ padding: 24, minHeight: '100%', background: '#F8FAFC' }}>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-bold text-slate-900">Log Running Hours</h2>
              <button onClick={() => { setModal(false); setSaveError(null); }}><X size={15} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {saveError && <div className="flex gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{saveError}</div>}
              <FLabel label="Equipment *">
                <select className={inp} value={form.equipmentId ?? ''} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
                  <option value="">Select equipment</option>
                  {allEquipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                </select>
              </FLabel>
              <div className="grid grid-cols-2 gap-3">
                <FLabel label="Running Hours Reading *"><input className={inp} type="number" min={0} value={form.runningHoursReading ?? ''} onChange={e => setForm(f => ({ ...f, runningHoursReading: Number(e.target.value) }))} placeholder="e.g. 12500" /></FLabel>
                <FLabel label="Log Date"><input className={inp} type="date" value={form.logDate ?? ''} onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))} /></FLabel>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FLabel label="Reported By"><input className={inp} value={form.reportedBy ?? ''} onChange={e => setForm(f => ({ ...f, reportedBy: e.target.value }))} /></FLabel>
                <FLabel label="Hours Since Last"><input className={inp} type="number" min={0} value={form.hoursSinceLast ?? ''} onChange={e => setForm(f => ({ ...f, hoursSinceLast: Number(e.target.value) }))} /></FLabel>
              </div>
              <FLabel label="Notes"><textarea className={inp} rows={2} value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></FLabel>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600">Cancel</button>
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
              <Gauge size={15} color="#4f46e6" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>Running Hours</h1>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 42 }}>Track cumulative running hours per equipment unit</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #4f46e6, #3730a3)', boxShadow: '0 2px 8px rgba(79,70,230,0.35)' }}
          onClick={() => { setForm({ logDate: new Date().toISOString().split('T')[0] }); setModal(true); }}
        >
          <Plus size={14} />Log Hours
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 60, color: '#94A3B8', fontSize: 13 }}>
          <Loader size={16} className="animate-spin" />Loading running hours…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {allEquipment.length === 0 ? (
            <div style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.05)' }}>
              <Gauge size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#94A3B8' }}>No equipment found</p>
            </div>
          ) : allEquipment.map(eq => {
            const latest = latestByEquip[eq.id];
            const allForEq = logs.filter(l => l.equipmentId === eq.id).sort((a, b) => (b.logDate ?? '') > (a.logDate ?? '') ? 1 : -1);
            const hrs = latest?.runningHoursReading ?? eq.runningHours;
            return (
              <div key={eq.id} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8', marginBottom: 3 }}>#{eq.code}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', lineHeight: 1.3 }}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{eq.system}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: hrs ? '#4f46e6' : '#CBD5E1', lineHeight: 1 }}>{hrs?.toLocaleString() ?? '—'}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>running hrs</div>
                  </div>
                </div>
                {latest && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <Clock size={11} color="#94A3B8" />
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>Last logged {latest.logDate} by {latest.reportedBy || 'unknown'}</span>
                  </div>
                )}
                {allForEq.length > 1 && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TrendingUp size={11} color="#059669" />
                    <span style={{ fontSize: 11, color: '#059669' }}>{allForEq.length} log entries</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent log entries */}
      {logs.length > 0 && (
        <div style={{ marginTop: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Recent Log Entries</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{logs.length} total</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {['Equipment', 'Reading (hrs)', 'Hours Since Last', 'Log Date', 'Reported By', 'Notes'].map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...logs].sort((a, b) => (b.logDate ?? '') > (a.logDate ?? '') ? 1 : -1).slice(0, 20).map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <td style={{ fontSize: 12, fontWeight: 600, padding: '9px 14px', color: '#1C1C1E' }}>{log.equipmentName || '—'}</td>
                  <td style={{ fontSize: 12, fontWeight: 700, padding: '9px 14px', color: '#4f46e6', fontFamily: 'monospace' }}>{log.runningHoursReading.toLocaleString()}</td>
                  <td style={{ fontSize: 12, padding: '9px 14px', color: '#64748B' }}>{log.hoursSinceLast ? `+${log.hoursSinceLast}` : '—'}</td>
                  <td style={{ fontSize: 12, padding: '9px 14px', color: '#374151' }}>{log.logDate || '—'}</td>
                  <td style={{ fontSize: 12, padding: '9px 14px', color: '#374151' }}>{log.reportedBy || '—'}</td>
                  <td style={{ fontSize: 12, padding: '9px 14px', color: '#94A3B8', maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.notes || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
