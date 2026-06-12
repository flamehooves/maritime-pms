import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import type { Equipment } from '../../types';
import { equipmentTree } from '../../data/equipment';
import { useApp } from '../../context/AppContext';

const statusDot: Record<string, string> = {
  operational: 'bg-emerald-500',
  under_maintenance: 'bg-amber-500',
  defect: 'bg-red-500 animate-pulse-red',
  inactive: 'bg-slate-400',
};

function getSubtreeStatus(node: Equipment): string {
  if (!node.children || node.children.length === 0) return node.status || 'operational';
  const statuses = node.children.map(getSubtreeStatus);
  if (statuses.includes('defect')) return 'defect';
  if (statuses.includes('under_maintenance')) return 'under_maintenance';
  return 'operational';
}

interface TreeNodeProps {
  node: Equipment;
  depth: number;
  showCodes: boolean;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  selectedId: string | null;
  onSelect: (eq: Equipment) => void;
  filter: string;
  searchQuery: string;
}

function TreeNode({ node, depth, showCodes, expandedIds, toggleExpand, selectedId, onSelect, filter, searchQuery }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const subtreeStatus = hasChildren ? getSubtreeStatus(node) : (node.status || 'operational');
  const dotClass = statusDot[subtreeStatus] || 'bg-slate-400';

  const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.code.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesFilter = filter === 'all' || (filter === 'defect' && subtreeStatus === 'defect') || (filter === 'maintenance' && subtreeStatus === 'under_maintenance') || (filter === 'critical' && node.criticality === 'critical');

  if (!matchesSearch && !matchesFilter) return null;

  return (
    <div>
      <div
        className={`eq-tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => {
          if (hasChildren) { toggleExpand(node.id); }
          if (!node.isGroup) { onSelect(node); }
        }}
      >
        {hasChildren ? (
          <span className="text-slate-400 flex-shrink-0 w-4">
            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}
        <span className={`status-dot flex-shrink-0 ${dotClass}`}></span>
        {showCodes && !node.isGroup && (
          <span className="eq-code text-xs font-mono text-slate-400 flex-shrink-0 min-w-20">{node.code}</span>
        )}
        <span className={`truncate ${node.isGroup ? 'text-xs font-semibold text-slate-600 uppercase tracking-wide' : 'text-sm text-slate-700'} ${isSelected ? 'text-sky-700 font-medium' : ''}`}>
          {node.name}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              showCodes={showCodes}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
              filter={filter}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getAllGroupIds(nodes: Equipment[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.isGroup || (node.children && node.children.length > 0)) {
      ids.push(node.id);
      if (node.children) ids.push(...getAllGroupIds(node.children));
    }
  }
  return ids;
}

export function EquipmentTree() {
  const { selectedEquipment, setSelectedEquipment } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCodes, setShowCodes] = useState(true);
  const [filter, setFilter] = useState('all');
  const allGroupIds = useMemo(() => getAllGroupIds(equipmentTree), []);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root', '310', '520']));

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedIds(new Set(allGroupIds));
  const collapseAll = () => setExpandedIds(new Set(['root']));

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'defect', label: 'Defects' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'critical', label: 'Critical' },
  ];

  return (
    <div
      className="flex flex-col bg-white border-r border-slate-200 h-full"
      style={{ flex: '1', minWidth: 0 }}
    >
      {/* Header */}
      <div className="px-3 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search equipment..."
              className="bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none w-full"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value) expandAll();
              }}
            />
          </div>
          <button
            onClick={() => setShowCodes(!showCodes)}
            className={`p-1.5 rounded-md border text-xs font-medium transition-colors ${showCodes ? 'bg-sky-50 border-sky-200 text-sky-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Toggle equipment codes"
          >
            <SlidersHorizontal size={13} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${filter === f.key ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={expandAll} className="text-xs text-slate-400 hover:text-slate-600 px-1">+</button>
            <button onClick={collapseAll} className="text-xs text-slate-400 hover:text-slate-600 px-1">−</button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 border-b border-slate-100">
        {[
          { label: 'Operational', cls: 'bg-emerald-500' },
          { label: 'Maintenance', cls: 'bg-amber-500' },
          { label: 'Defect', cls: 'bg-red-500' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${l.cls}`}></div>
            <span className="text-xs text-slate-500">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {equipmentTree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            showCodes={showCodes}
            expandedIds={expandedIds}
            toggleExpand={toggleExpand}
            selectedId={selectedEquipment?.id || null}
            onSelect={setSelectedEquipment}
            filter={filter}
            searchQuery={searchQuery}
          />
        ))}
      </div>
    </div>
  );
}
