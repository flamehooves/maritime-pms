import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchEquipments } from '../../services/crmService';
import type { Equipment } from '../../types';

const statusStyle: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
  operational:       { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', dot: '#16a34a', label: 'Operational' },
  under_maintenance: { bg: '#eef2ff', border: '#d97706', text: '#b45309', dot: '#d97706', label: 'Maintenance' },
  defect:            { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c', dot: '#dc2626', label: 'Defect' },
  inactive:          { bg: '#f9fafb', border: '#9ca3af', text: '#6b7280', dot: '#9ca3af', label: 'Inactive' },
};

function getStyle(status: string | undefined) {
  return statusStyle[status ?? 'operational'] ?? statusStyle.operational;
}

export function EquipmentOverviewPage() {
  const navigate = useNavigate();
  const { setSelectedEquipment, currentVessel, currentVesselId } = useApp();

  const { data: equipments, loading } = useCrmFetch(
    () => fetchEquipments(currentVesselId),
    [currentVesselId]
  );

  const allItems = equipments.filter(e => !e.isGroup);

  const bySystem: Record<string, Equipment[]> = {};
  for (const eq of allItems) {
    const sys = eq.system || 'General';
    if (!bySystem[sys]) bySystem[sys] = [];
    bySystem[sys].push(eq);
  }
  const groups = Object.entries(bySystem).map(([groupName, items]) => ({ groupName, items }));

  const total = allItems.length;
  const operational = allItems.filter(e => !e.status || e.status === 'operational').length;
  const maintenance = allItems.filter(e => e.status === 'under_maintenance').length;
  const defect = allItems.filter(e => e.status === 'defect').length;
  const opPct = total > 0 ? Math.round((operational / total) * 100) : 0;

  const handleTileClick = (eq: Equipment) => {
    setSelectedEquipment(eq);
    navigate('/equipment');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
        <Loader size={16} className="animate-spin" /> Loading equipment…
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full w-full overflow-y-auto" style={{ background: '#f8fafc' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment Health Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">{currentVessel.name} · Live equipment status from CRM</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Equipment', value: total, color: '#3b82f6' },
          { label: 'Operational', value: `${opPct}%`, color: '#16a34a' },
          { label: 'In Maintenance', value: maintenance, color: '#d97706' },
          { label: 'Defects', value: defect, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Legend:</span>
        {Object.values(statusStyle).map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.bg, border: `2px solid ${s.border}` }}></div>
            <span style={{ fontSize: 12, color: '#475569' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No equipment found in CRM. Add equipment via the Equipment module in Zoho CRM.</div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => (
            <div key={group.groupName}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{group.groupName}</h2>
                <div style={{ height: 1, flex: 1, background: '#e2e8f0' }}></div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{group.items.length} items</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {group.items.map(eq => {
                  const s = getStyle(eq.status);
                  return (
                    <div
                      key={eq.id}
                      onClick={() => handleTileClick(eq)}
                      title={`#${eq.code} ${eq.name}`}
                      style={{
                        width: 120, height: 80, background: s.bg, borderLeft: `3px solid ${s.border}`,
                        borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.10)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)'; }}
                    >
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: s.border, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        #{eq.code}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {eq.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }}></div>
                        <span style={{ fontSize: 10, color: s.text }}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
