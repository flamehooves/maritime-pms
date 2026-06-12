import React, { useState } from 'react';
import { LayoutGrid, List, Activity } from 'lucide-react';
import { EquipmentTree } from './EquipmentTree';
import { EquipmentDetail } from './EquipmentDetail';
import { useApp } from '../../context/AppContext';
import { flattenEquipment, equipmentTree } from '../../data/equipment';
import type { Equipment } from '../../types';

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  operational: { bg: '#DCFCE7', border: '#34C759', text: '#15803D' },
  under_maintenance: { bg: '#FFF3DC', border: '#FF9F0A', text: '#CC7A00' },
  defect: { bg: '#FFE5E4', border: '#FF453A', text: '#CC1100' },
  inactive: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

// ── Equipment Heatmap (right-panel default when nothing selected) ──────────
const STATUS_CFG = {
  operational:      { bg: '#D1FAE5', border: '#22C55E', dot: '#16A34A', label: 'Operational' },
  under_maintenance:{ bg: '#FEF3C7', border: '#F59E0B', dot: '#D97706', label: 'Maintenance' },
  defect:           { bg: '#FEE2E2', border: '#EF4444', dot: '#DC2626', label: 'Defect' },
  inactive:         { bg: '#F1F5F9', border: '#94A3B8', dot: '#64748B', label: 'Inactive' },
};

function EquipmentHeatmap({ onSelect }: { onSelect: (eq: Equipment) => void }) {
  // Build system groups from the tree (top-level children of root)
  const root = equipmentTree[0];
  const systems = root?.children ?? [];

  // Count stats
  const all = flattenEquipment(equipmentTree).filter(e => !e.isGroup);
  const total = all.length;
  const byStatus = {
    operational: all.filter(e => (e.status ?? 'operational') === 'operational').length,
    under_maintenance: all.filter(e => e.status === 'under_maintenance').length,
    defect: all.filter(e => e.status === 'defect').length,
    inactive: all.filter(e => e.status === 'inactive').length,
  };

  return (
    <div className="overflow-y-auto h-full" style={{ background: '#F8FAFC' }}>
      {/* Header */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={16} className="text-slate-400" />
          <h2 className="text-base font-bold text-slate-900">Equipment Health Heatmap</h2>
        </div>
        <p className="text-xs text-slate-500">Click any equipment tile to view details and drill down</p>

        {/* Summary row */}
        <div className="flex gap-3 mt-3">
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: cfg.bg, border: `1px solid ${cfg.border}40` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}></div>
              <span style={{ color: cfg.dot }}>{byStatus[key as keyof typeof byStatus]}</span>
              <span className="text-slate-500">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 ml-auto">
            {total} total equipment
          </div>
        </div>
      </div>

      {/* System sections */}
      <div className="px-6 pb-6 space-y-5">
        {systems.map(system => {
          const sysItems = flattenEquipment([system]).filter(e => !e.isGroup);
          if (sysItems.length === 0) return null;
          const hasDefect = sysItems.some(e => e.status === 'defect');
          const hasMaint  = sysItems.some(e => e.status === 'under_maintenance');
          const systemStatus = hasDefect ? 'defect' : hasMaint ? 'under_maintenance' : 'operational';
          const cfg = STATUS_CFG[systemStatus];

          return (
            <div key={system.id}>
              {/* System header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }}></div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{system.name}</span>
                <div className="flex-1 h-px" style={{ background: '#E2E8F0' }}></div>
                <span className="text-xs text-slate-400">{sysItems.length} items</span>
              </div>

              {/* Equipment tiles */}
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {sysItems.map(eq => {
                  const st = eq.status ?? 'operational';
                  const c = STATUS_CFG[st as keyof typeof STATUS_CFG] ?? STATUS_CFG.operational;
                  return (
                    <button
                      key={eq.id}
                      onClick={() => onSelect(eq)}
                      className="text-left rounded-xl p-2.5 transition-all hover:scale-[1.03] hover:shadow-md focus:outline-none"
                      style={{
                        background: c.bg,
                        border: `1.5px solid ${c.border}60`,
                        boxShadow: `0 2px 0 0 ${c.border}30`,
                      }}
                      title={eq.name}
                    >
                      <div className="text-xs font-mono mb-0.5 truncate" style={{ color: c.dot, opacity: 0.8 }}>{eq.code}</div>
                      <div className="text-xs font-semibold text-slate-800 leading-tight truncate">{eq.name}</div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }}></div>
                        <span className="text-xs" style={{ color: c.dot }}>
                          {st === 'under_maintenance' ? 'Maint.' : st.charAt(0).toUpperCase() + st.slice(1)}
                        </span>
                      </div>
                    </button>
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

function EquipmentGridView({ onSelect, selectedId }: { onSelect: (eq: Equipment) => void; selectedId: string | null }) {
  const allEquipment = flattenEquipment(equipmentTree).filter(e => !e.isGroup);

  return (
    <div className="overflow-y-auto h-full p-3" style={{ background: '#F5F5F7' }}>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {allEquipment.map(eq => {
          const status = eq.status ?? 'operational';
          const colors = statusColors[status] ?? statusColors.operational;
          const isSelected = selectedId === eq.id;

          return (
            <div
              key={eq.id}
              className="rounded-xl p-3 cursor-pointer transition-all"
              style={{
                background: isSelected ? colors.border : colors.bg,
                borderLeft: `4px solid ${colors.border}`,
                boxShadow: isSelected
                  ? `0 4px 0 0 ${colors.border}66, 0 6px 16px rgba(0,0,0,0.14)`
                  : `0 4px 0 0 ${colors.border}33, 0 6px 12px rgba(0,0,0,0.08)`,
                transform: isSelected ? 'scale(1.02)' : undefined,
              }}
              onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              onClick={() => onSelect(eq)}
            >
              <div className="text-xs font-mono mb-0.5 truncate" style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : colors.border }}>{eq.code}</div>
              <div className="text-xs font-semibold leading-tight truncate" style={{ color: isSelected ? '#fff' : '#1C1C1E' }} title={eq.name}>{eq.name}</div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isSelected ? 'rgba(255,255,255,0.8)' : colors.border }}></div>
                <span className="text-xs capitalize" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : colors.text }}>
                  {status === 'under_maintenance' ? 'Maint.' : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function EquipmentPage() {
  const { selectedEquipment, setSelectedEquipment } = useApp();
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');

  return (
    <div className="flex h-full overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Left panel */}
      <div className="flex flex-col h-full" style={{ width: '300px', minWidth: '300px', flexShrink: 0 }}>
        {/* View toggle */}
        <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-slate-200" style={{ borderRight: '1px solid #E5E7EB' }}>
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'tree' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <List size={12} />
            Tree View
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid size={12} />
            Grid View
          </button>
        </div>

        {viewMode === 'tree' ? (
          <EquipmentTree />
        ) : (
          <EquipmentGridView
            onSelect={setSelectedEquipment}
            selectedId={selectedEquipment?.id ?? null}
          />
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedEquipment && !selectedEquipment.isGroup
          ? <EquipmentDetail equipment={selectedEquipment} />
          : <EquipmentHeatmap onSelect={setSelectedEquipment} />
        }
      </div>
    </div>
  );
}
