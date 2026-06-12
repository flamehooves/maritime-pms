import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { EquipmentTree } from './EquipmentTree';
import { EquipmentDetail } from './EquipmentDetail';
import { EquipmentOverviewPage } from './EquipmentOverviewPage';
import { useApp } from '../../context/AppContext';
import { flattenEquipment, equipmentTree } from '../../data/equipment';
import type { Equipment } from '../../types';

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  operational:       { bg: '#D1FAE5', border: '#22C55E', dot: '#16A34A', glow: 'rgba(34,197,94,0.3)',  label: 'Operational' },
  under_maintenance: { bg: "#FEF3C7", border: "#F59E0B", dot: '#D97706', glow: 'rgba(79,70,230,0.3)', label: 'Maintenance' },
  defect:            { bg: '#FEE2E2', border: '#EF4444', dot: '#DC2626', glow: 'rgba(239,68,68,0.3)',   label: 'Defect' },
  inactive:          { bg: '#F1F5F9', border: '#94A3B8', dot: '#64748B', glow: 'rgba(148,163,184,0.3)', label: 'Inactive' },
};

// ── Liquid glass style helper ─────────────────────────────────────────────
const glassPanel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
};

// ── Heatmap: small colored blocks, tooltip on hover ───────────────────────
function EquipmentHeatmap({ onSelect }: { onSelect: (eq: Equipment) => void }) {
  const root = equipmentTree[0];
  const systems = root?.children ?? [];
  const all = flattenEquipment(equipmentTree).filter(e => !e.isGroup);
  const byStatus = {
    operational:       all.filter(e => (e.status ?? 'operational') === 'operational').length,
    under_maintenance: all.filter(e => e.status === 'under_maintenance').length,
    defect:            all.filter(e => e.status === 'defect').length,
    inactive:          all.filter(e => e.status === 'inactive').length,
  };

  return (
    <div className="overflow-y-auto h-full" style={{ padding: '20px 20px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Activity size={15} color="#94A3B8" />
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E' }}>Equipment Health Heatmap</span>
      </div>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>Hover a block to identify · click to drill down</p>

      {/* Legend row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${cfg.border}40`,
            boxShadow: `0 1px 4px ${cfg.glow}`,
            fontSize: 11, fontWeight: 500,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: cfg.dot, boxShadow: `0 0 4px ${cfg.glow}` }} />
            <span style={{ color: cfg.dot }}>{byStatus[key as keyof typeof byStatus]}</span>
            <span style={{ color: '#6B7280' }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* System sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {systems.map(system => {
          const sysItems = flattenEquipment([system]).filter(e => !e.isGroup);
          if (sysItems.length === 0) return null;
          const hasDefect = sysItems.some(e => e.status === 'defect');
          const hasMaint  = sysItems.some(e => e.status === 'under_maintenance');
          const sysSt     = hasDefect ? 'defect' : hasMaint ? 'under_maintenance' : 'operational';
          const sysCfg    = STATUS_CFG[sysSt];

          return (
            <div key={system.id}>
              {/* Section label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: sysCfg.dot, boxShadow: `0 0 6px ${sysCfg.glow}` }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{system.name}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{sysItems.length}</span>
              </div>

              {/* Block grid — small colored squares only, tooltip shows name */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {sysItems.map(eq => {
                  const st  = eq.status ?? 'operational';
                  const cfg = STATUS_CFG[st as keyof typeof STATUS_CFG] ?? STATUS_CFG.operational;
                  return (
                    <button
                      key={eq.id}
                      title={`${eq.code} · ${eq.name}`}
                      onClick={() => onSelect(eq)}
                      style={{
                        width: 32, height: 32,
                        borderRadius: 7,
                        border: `1.5px solid ${cfg.border}70`,
                        background: `linear-gradient(145deg, ${cfg.bg}, ${cfg.border}20)`,
                        boxShadow: `0 2px 6px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.8)`;
                        (e.currentTarget as HTMLElement).style.zIndex = '10';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 6px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.6)`;
                        (e.currentTarget as HTMLElement).style.zIndex = '1';
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main EquipmentPage ────────────────────────────────────────────────────
type RightTab = 'heatmap' | 'overview';

export function EquipmentPage() {
  const { selectedEquipment, setSelectedEquipment } = useApp();
  const [rightTab, setRightTab] = useState<RightTab>('heatmap');

  // When an equipment item is clicked from the heatmap, show its detail
  const handleSelect = (eq: Equipment) => {
    setSelectedEquipment(eq);
  };

  const showDetail = !!(selectedEquipment && !selectedEquipment.isGroup);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 76px)', overflow: 'hidden', padding: '0 12px 12px' }}>

      {/* ── Left panel ── */}
      <div style={{
        ...glassPanel,
        width: 280, minWidth: 280, flexShrink: 0,
        borderRadius: 16,
        marginRight: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Tab bar inside left panel: Health Heatmap | Equipment Overview */}
        <div style={{
          display: 'flex', gap: 4,
          padding: '8px 10px 6px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>
          {([
            { key: 'heatmap',  label: 'Health Heatmap' },
            { key: 'overview', label: 'Eq. Overview' },
          ] as { key: RightTab; label: string }[]).map(tab => {
            const active = rightTab === tab.key && !showDetail;
            return (
              <button
                key={tab.key}
                onClick={() => { setRightTab(tab.key); setSelectedEquipment(null as any); }}
                style={{
                  flex: 1, padding: '5px 6px', borderRadius: 10,
                  fontSize: 11, fontWeight: active ? 600 : 500,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: active ? 'rgba(79,70,230,0.2)' : 'transparent',
                  color: active ? '#4338ca' : 'rgba(60,60,67,0.5)',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(79,70,230,0.4)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tree view only */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <EquipmentTree />
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        ...glassPanel,
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {showDetail
          ? <EquipmentDetail equipment={selectedEquipment!} />
          : rightTab === 'overview'
            ? <EquipmentOverviewPage />
            : <EquipmentHeatmap onSelect={handleSelect} />
        }
      </div>
    </div>
  );
}
