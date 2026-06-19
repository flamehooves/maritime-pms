import React, { useState, useMemo } from 'react';
import { Activity, Loader } from 'lucide-react';
import { EquipmentTree } from './EquipmentTree';
import { EquipmentDetail } from './EquipmentDetail';
import { EquipmentOverviewPage } from './EquipmentOverviewPage';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchEquipments } from '../../services/crmService';
import type { Equipment } from '../../types';

const STATUS_CFG = {
  operational:       { bg: '#D1FAE5', border: '#22C55E', dot: '#16A34A', glow: 'rgba(34,197,94,0.3)',  label: 'Operational' },
  under_maintenance: { bg: "#FEF3C7", border: "#F59E0B", dot: '#D97706', glow: 'rgba(79,70,230,0.3)', label: 'Maintenance' },
  defect:            { bg: '#FEE2E2', border: '#EF4444', dot: '#DC2626', glow: 'rgba(239,68,68,0.3)',   label: 'Defect' },
  inactive:          { bg: '#F1F5F9', border: '#94A3B8', dot: '#64748B', glow: 'rgba(148,163,184,0.3)', label: 'Inactive' },
};

const glassPanel: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.8)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
};

// Standard maritime system codes (multiples of 100)
const SYSTEM_CODES: Record<string, number> = {
  'Propulsion': 100,
  'Auxiliary Engine': 200,
  'Machinery': 300,
  "Ship's Equipment": 400,
  'Life Saving': 500,
  'Navigation & Steering': 600,
  'Environmental': 700,
  'Compressed Air': 800,
  'Fresh Water': 900,
  'Bilge & Ballast': 1000,
  'Safety': 1100,
  'Electrical': 1200,
  'Ballast': 1300,
};

let _nextSysCode = 1400;
const _assignedSysCodes: Record<string, number> = { ...SYSTEM_CODES };

function getSysCode(system: string): number {
  if (_assignedSysCodes[system]) return _assignedSysCodes[system];
  _assignedSysCodes[system] = _nextSysCode;
  _nextSysCode += 100;
  return _assignedSysCodes[system];
}

function assignHierarchyCodes(nodes: Equipment[], prefix: string): void {
  nodes.forEach((node, i) => {
    node.code = `${prefix}.${i + 1}`;
    if (node.children && node.children.length > 0) {
      assignHierarchyCodes(node.children, node.code);
    }
  });
}

function buildEquipmentTree(flat: Equipment[]): Equipment[] {
  // Build a true N-level hierarchy using parentId, then group root nodes by System.
  const byId: Record<string, Equipment> = {};
  for (const eq of flat) byId[eq.id] = { ...eq, children: [] };

  const roots: Equipment[] = [];
  for (const eq of flat) {
    if (eq.parentId && byId[eq.parentId]) {
      byId[eq.parentId].children!.push(byId[eq.id]);
    } else {
      roots.push(byId[eq.id]);
    }
  }

  // Group top-level nodes by System
  const bySystem: Record<string, Equipment[]> = {};
  for (const node of roots) {
    const sys = node.system || 'General';
    if (!bySystem[sys]) bySystem[sys] = [];
    bySystem[sys].push(node);
  }

  return Object.entries(bySystem).map(([sys, items]) => {
    const sysCode = getSysCode(sys);
    // Assign hierarchical codes: 100.1, 100.2, 100.1.1 etc.
    assignHierarchyCodes(items, String(sysCode));
    return {
      id: `sys_${sys}`,
      code: String(sysCode),
      name: sys,
      isGroup: true,
      children: items,
    } as Equipment;
  });
}

function EquipmentHeatmap({ flat, onSelect }: { flat: Equipment[]; onSelect: (eq: Equipment) => void }) {
  const systems = useMemo(() => {
    const bySystem: Record<string, Equipment[]> = {};
    for (const eq of flat) {
      const sys = eq.system || 'General';
      if (!bySystem[sys]) bySystem[sys] = [];
      bySystem[sys].push(eq);
    }
    return Object.entries(bySystem).map(([name, items]) => ({ name, items }));
  }, [flat]);

  const byStatus = {
    operational:       flat.filter(e => (e.status ?? 'operational') === 'operational').length,
    under_maintenance: flat.filter(e => e.status === 'under_maintenance').length,
    defect:            flat.filter(e => e.status === 'defect').length,
    inactive:          flat.filter(e => e.status === 'inactive').length,
  };

  return (
    <div className="overflow-y-auto h-full" style={{ padding: '20px 20px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Activity size={15} color="#94A3B8" />
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E' }}>Equipment Health Heatmap</span>
      </div>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 14 }}>Hover a block to identify · click to drill down</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            border: `1px solid ${cfg.border}40`, boxShadow: `0 1px 4px ${cfg.glow}`,
            fontSize: 11, fontWeight: 500,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: cfg.dot, boxShadow: `0 0 4px ${cfg.glow}` }} />
            <span style={{ color: cfg.dot }}>{byStatus[key as keyof typeof byStatus]}</span>
            <span style={{ color: '#6B7280' }}>{cfg.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {systems.map(({ name, items }) => {
          const hasDefect = items.some(e => e.status === 'defect');
          const hasMaint  = items.some(e => e.status === 'under_maintenance');
          const sysSt     = hasDefect ? 'defect' : hasMaint ? 'under_maintenance' : 'operational';
          const sysCfg    = STATUS_CFG[sysSt];
          return (
            <div key={name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: sysCfg.dot, boxShadow: `0 0 6px ${sysCfg.glow}` }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{name}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.07)' }} />
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {items.map(eq => {
                  const st  = eq.status ?? 'operational';
                  const cfg = STATUS_CFG[st as keyof typeof STATUS_CFG] ?? STATUS_CFG.operational;
                  return (
                    <button
                      key={eq.id}
                      title={`${eq.code} · ${eq.name}`}
                      onClick={() => onSelect(eq)}
                      style={{
                        width: 32, height: 32, borderRadius: 7,
                        border: `1.5px solid ${cfg.border}70`,
                        background: `linear-gradient(145deg, ${cfg.bg}, ${cfg.border}20)`,
                        boxShadow: `0 2px 6px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
                        cursor: 'pointer', transition: 'all 0.12s ease', flexShrink: 0,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)';
                        (e.currentTarget as HTMLElement).style.zIndex = '10';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                        (e.currentTarget as HTMLElement).style.zIndex = '1';
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        {flat.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, paddingTop: 32 }}>
            No equipment data. Add equipment in Zoho CRM.
          </div>
        )}
      </div>
    </div>
  );
}

type RightTab = 'heatmap' | 'overview';

export function EquipmentPage() {
  const { selectedEquipment, setSelectedEquipment, currentVesselId } = useApp();
  const [rightTab, setRightTab] = useState<RightTab>('heatmap');

  const { data: equipments, loading } = useCrmFetch(
    () => fetchEquipments(currentVesselId),
    [currentVesselId]
  );

  const equipmentTree = useMemo(() => buildEquipmentTree(equipments), [equipments]);

  const showDetail = !!(selectedEquipment && !selectedEquipment.isGroup);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 76px)', overflow: 'hidden', padding: '0 12px 12px' }}>
      {/* Left panel */}
      <div style={{
        ...glassPanel,
        width: 280, minWidth: 280, flexShrink: 0,
        borderRadius: 16, marginRight: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', gap: 4,
          padding: '8px 10px 6px',
          borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0,
        }}>
          {([
            { key: 'heatmap',  label: 'Health Heatmap' },
            { key: 'overview', label: 'Eq. Overview' },
          ] as { key: RightTab; label: string }[]).map(tab => {
            const active = rightTab === tab.key && !showDetail;
            return (
              <button
                key={tab.key}
                onClick={() => { setRightTab(tab.key); setSelectedEquipment(null as unknown as Equipment); }}
                style={{
                  flex: 1, padding: '5px 6px', borderRadius: 10,
                  fontSize: 11, fontWeight: active ? 600 : 500,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
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

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full gap-2 text-slate-400 text-sm">
              <Loader size={16} className="animate-spin" /> Loading…
            </div>
          ) : (
            <EquipmentTree equipmentTree={equipmentTree} />
          )}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        ...glassPanel,
        flex: 1, borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {showDetail
          ? <EquipmentDetail equipment={selectedEquipment!} />
          : rightTab === 'overview'
            ? <EquipmentOverviewPage />
            : <EquipmentHeatmap flat={equipments} onSelect={setSelectedEquipment} />
        }
      </div>
    </div>
  );
}
