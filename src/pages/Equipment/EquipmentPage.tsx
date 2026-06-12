import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { EquipmentTree } from './EquipmentTree';
import { EquipmentDetail, EquipmentDetailEmpty } from './EquipmentDetail';
import { useApp } from '../../context/AppContext';
import { flattenEquipment, equipmentTree } from '../../data/equipment';
import type { Equipment } from '../../types';

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  operational: { bg: '#DCFCE7', border: '#34C759', text: '#15803D' },
  under_maintenance: { bg: '#FFF3DC', border: '#FF9F0A', text: '#CC7A00' },
  defect: { bg: '#FFE5E4', border: '#FF453A', text: '#CC1100' },
  inactive: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

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
          : <EquipmentDetailEmpty />
        }
      </div>
    </div>
  );
}
