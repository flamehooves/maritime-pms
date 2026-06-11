import React, { useState } from 'react';
import { CheckSquare, X, Eye } from 'lucide-react';
import { PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';

const approvals = [
  { id: 'a1', type: 'Job Order', title: 'Fire Pump No.1 – Annual Overhaul', vessel: 'MAHAKALI', joNumber: 'JO-2025-0039', requestedBy: 'John Torres', date: 'Jan 9, 2025', priority: 'High', description: 'Annual overhaul complete. Impeller replaced, mechanical seal renewed. Pump tested at 4.2 bar.' },
  { id: 'a2', type: 'Job Order', title: 'Emergency Generator Monthly Test', vessel: 'MAHAKALI', joNumber: 'JO-2025-0036', requestedBy: 'R. Gupta', date: 'Jan 9, 2025', priority: 'High', description: 'Monthly test run completed. 45 min at full load. All alarms satisfactory.' },
  { id: 'a3', type: 'Job Order', title: 'AIS Transponder Annual Inspection', vessel: 'MAHAKALI', joNumber: 'JO-2025-0044', requestedBy: 'C. Santos', date: 'Jan 8, 2025', priority: 'High', description: 'AIS data verified. MMSI, dimensions and voyage data confirmed accurate.' },
  { id: 'a4', type: 'Spare Request', title: 'M/E Exhaust Valve Spindle × 6', vessel: 'MAHAKALI', joNumber: 'SR-2025-0012', requestedBy: 'Chief Engineer', date: 'Jan 7, 2025', priority: 'Critical', description: 'Current stock: 3. Minimum required: 6. Needed for upcoming M/E overhaul schedule.' },
  { id: 'a5', type: 'Spare Request', title: 'Fuel Injection Nozzle (6S60MC-C) × 6', vessel: 'SEALION SPIRIT', joNumber: 'SR-2025-0011', requestedBy: 'K. Pereira', date: 'Jan 7, 2025', priority: 'High', description: 'Current stock: 0. Required for injection valve overhaul per JP-FIP-001.' },
  { id: 'a6', type: 'Defect Update', title: 'DEF-2025-001 – Lifeboat Stbd Engine Start Failure', vessel: 'MAHAKALI', joNumber: 'DEF-2025-001', requestedBy: 'Chief Officer', date: 'Jan 6, 2025', priority: 'Critical', description: 'Severity: Critical. Status under investigation. JO-2025-0038 raised. Requires superintendent awareness.' },
  { id: 'a7', type: 'Job Order', title: 'M/E Cylinder No.3 – Piston Inspection', vessel: 'PACIFIC TRADER', joNumber: 'JO-2025-0019', requestedBy: 'E. Mendoza', date: 'Jan 5, 2025', priority: 'High', description: 'Piston inspection during top overhaul. Crown condition acceptable. Rings replaced.' },
  { id: 'a8', type: 'Spare Request', title: 'Caterpillar C9.3 Service Kit', vessel: 'NORTHERN STAR', joNumber: 'SR-2025-0010', requestedBy: 'V. Patel', date: 'Jan 4, 2025', priority: 'Medium', description: 'Emergency generator service due March 2025. Parts required 4 weeks ahead.' },
];

const typeColors: Record<string, string> = {
  'Job Order': 'bg-sky-50 text-sky-700 border border-sky-200',
  'Spare Request': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Defect Update': 'bg-red-50 text-red-700 border border-red-200',
};

export function ApprovalsPage() {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('All');
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  const pending = approvals.filter(a => !approved.has(a.id) && !rejected.has(a.id));
  const filtered = pending.filter(a => typeFilter === 'All' || a.type === typeFilter);

  return (
    <div className="p-6 min-h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approval Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentRole === 'admin' ? 'Fleet-wide' : 'MAHAKALI'} · {pending.length} pending approvals
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-5">
        {[
          { key: 'pending', label: `Pending (${pending.length})` },
          { key: 'history', label: `Resolved (${approved.size + rejected.size})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-button ${activeTab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        <>
          <div className="flex items-center gap-2 mb-4">
            {['All', 'Job Order', 'Spare Request', 'Defect Update'].map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === f ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{f}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(a => (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${typeColors[a.type]}`}>{a.type}</span>
                      <PriorityBadge priority={a.priority} />
                      <span className="text-xs font-mono text-slate-400">{a.joNumber}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{a.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{a.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Vessel: <span className="text-slate-600 font-medium">{a.vessel}</span></span>
                      <span>By: <span className="text-slate-600">{a.requestedBy}</span></span>
                      <span>{a.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                      <Eye size={13} />View
                    </button>
                    <button
                      onClick={() => { const s = new Set(rejected); s.add(a.id); setRejected(s); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors"
                    >
                      <X size={13} />Reject
                    </button>
                    <button
                      onClick={() => { const s = new Set(approved); s.add(a.id); setApproved(s); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      <CheckSquare size={13} />Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <CheckSquare size={32} className="mx-auto mb-3 text-emerald-400" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm mt-1">No pending approvals in this category.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">{approved.size + rejected.size} items resolved in this session.</p>
        </div>
      )}
    </div>
  );
}
