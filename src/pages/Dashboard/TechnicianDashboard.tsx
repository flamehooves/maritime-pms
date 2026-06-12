import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Play, Pause, ChevronRight, Wrench } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { flattenEquipment, equipmentTree } from '../../data/equipment';

const myJobs = [
  {
    joNumber: 'JO-2025-0039', equipment: 'FIRE PUMP NO.1', system: 'Fire & Safety',
    title: 'Annual Overhaul – Completion Review', priority: 'High', dueTime: 'Today, 14:00',
    estimatedHours: 1, status: 'Awaiting Review', progress: 100,
  },
  {
    joNumber: 'JO-2025-0038', equipment: 'LIFEBOAT ENGINE NO.2', system: 'Fire & Safety',
    title: 'Defect Repair – Fuel System Inspection', priority: 'Critical', dueTime: 'Today, 17:00',
    estimatedHours: 4, status: 'Not Started', progress: 0,
  },
  {
    joNumber: 'JO-2025-0033', equipment: 'FIRE PUMPS', system: 'Fire & Safety',
    title: 'Weekly Test Run (Pumps No.1 & No.2)', priority: 'High', dueTime: 'Today, 09:00',
    estimatedHours: 1, status: 'Not Started', progress: 0,
  },
];

const allMyJobs = [
  { joNumber: 'JO-2025-0044', equipment: 'AIS TRANSPONDER', title: 'Annual Inspection', priority: 'High', dueDate: 'Jan 18', status: 'Awaiting Review' },
  { joNumber: 'JO-2025-0015', equipment: 'SMOKE DETECTORS', title: 'Quarterly Test – Accommodation', priority: 'Medium', dueDate: 'Jan 25', status: 'Not Started' },
  { joNumber: 'JO-2025-0012', equipment: 'CO2 SYSTEM', title: 'Cylinder Pressure Check', priority: 'High', dueDate: 'Feb 10', status: 'Not Started' },
  { joNumber: 'JO-2024-0198', equipment: 'CYLINDER UNIT NO.1', title: 'Inspection – Assist CE', priority: 'High', dueDate: 'Dec 1', status: 'Approved' },
  { joNumber: 'JO-2024-0185', equipment: 'MAIN SWITCHBOARD', title: 'Annual Inspection – Assist', priority: 'High', dueDate: 'Sep 15', status: 'Approved' },
  { joNumber: 'JO-2025-0036', equipment: 'EMERGENCY GENERATOR', title: 'Monthly Test – Assist', priority: 'High', dueDate: 'Jan 15', status: 'Awaiting Review' },
];

const statusConfig = {
  operational: { bg: '#DCFCE7', color: '#34C759' },
  under_maintenance: { bg: '#FFF3DC', color: '#FF9F0A' },
  defect: { bg: '#FFE5E4', color: '#FF453A' },
  inactive: { bg: '#F3F4F6', color: '#9CA3AF' },
};

function EquipmentHeatmap() {
  const allEquipment = flattenEquipment(equipmentTree).filter(e => !e.isGroup);

  // Group by system
  const bySystem: Record<string, typeof allEquipment> = {};
  for (const eq of allEquipment) {
    const sys = eq.system ?? 'Other';
    if (!bySystem[sys]) bySystem[sys] = [];
    bySystem[sys].push(eq);
  }

  return (
    <div className="bento-tile p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Equipment Health Overview</h3>
        <p className="text-xs text-slate-500 mt-0.5">All equipment status grouped by system — hover for details</p>
      </div>
      <div className="space-y-4">
        {Object.entries(bySystem).map(([system, eqs]) => (
          <div key={system}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{system}</div>
            <div className="flex flex-wrap gap-1.5">
              {eqs.map(eq => {
                const status = eq.status ?? 'operational';
                const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.operational;
                return (
                  <div
                    key={eq.id}
                    title={`${eq.name}\nStatus: ${status}${eq.lastMaintenance ? `\nLast: ${eq.lastMaintenance}` : ''}`}
                    className="rounded-md cursor-pointer transition-all hover:scale-110"
                    style={{
                      width: '20px',
                      height: '20px',
                      background: cfg.bg,
                      border: `2px solid ${cfg.color}`,
                      flexShrink: 0,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        {[
          { label: 'Operational', color: '#34C759', bg: '#DCFCE7' },
          { label: 'Maintenance', color: '#FF9F0A', bg: '#FFF3DC' },
          { label: 'Defect', color: '#FF453A', bg: '#FFE5E4' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: item.bg, border: `2px solid ${item.color}` }}></div>
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechnicianDashboard() {
  const [activeJob, setActiveJob] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-5 min-h-full w-full" style={{ background: '#F5F5F7' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning, John.</h1>
          <p className="text-sm text-slate-500 mt-0.5">Saturday, 11 January 2025 · MAHAKALI · Singapore Anchorage</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-xs text-slate-500 mb-1 font-medium">Assigned Jobs</div>
          <div className="text-2xl font-bold text-slate-900">9</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#FFE5E4', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-xs font-medium mb-1" style={{ color: '#FF453A' }}>Due Today</div>
          <div className="text-2xl font-bold" style={{ color: '#CC1100' }}>3</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#EBF2FF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-xs font-medium mb-1" style={{ color: '#5B8DEF' }}>In Progress</div>
          <div className="text-2xl font-bold" style={{ color: '#1D4ED8' }}>2</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: '#F3E8FF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="text-xs font-medium mb-1" style={{ color: '#BF5AF2' }}>Awaiting Review</div>
          <div className="text-2xl font-bold" style={{ color: '#7C3AED' }}>4</div>
        </div>
      </div>

      {/* Equipment Heatmap */}
      <EquipmentHeatmap />

      <div className="grid grid-cols-3 gap-5">
        {/* Today's Priority Jobs */}
        <div className="col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Today's Priority Jobs</h2>
          {myJobs.map((job) => (
            <div
              key={job.joNumber}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: '#FFFFFF',
                boxShadow: job.priority === 'Critical'
                  ? '0 2px 12px rgba(255,69,58,0.12), 0 0 0 1px rgba(255,69,58,0.15)'
                  : '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={job.priority} />
                    <span className="text-xs font-mono text-slate-400">{job.joNumber}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{job.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{job.equipment} · {job.system}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <StatusBadge status={job.status} />
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-end">
                    <Clock size={11} />
                    {job.dueTime}
                  </div>
                </div>
              </div>

              {job.progress > 0 && job.progress < 100 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span><span>{job.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${job.progress}%`, background: '#5B8DEF' }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {job.status === 'Not Started' && (
                  <button
                    onClick={() => setActiveJob(job.joNumber)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-white text-sm font-medium rounded-xl transition-colors"
                    style={{ background: '#5B8DEF' }}
                  >
                    <Play size={14} />
                    Start Work
                  </button>
                )}
                {job.status === 'In Progress' && (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white text-sm font-medium rounded-xl transition-colors" style={{ background: '#5B8DEF' }}>
                      <CheckCircle size={14} />
                      Complete
                    </button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                      <Pause size={14} />
                    </button>
                  </>
                )}
                {job.status === 'Awaiting Review' && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-xl" style={{ background: '#F3E8FF', color: '#7C3AED', border: '1px solid #E9D5FF' }}>
                    <CheckCircle size={14} />
                    Submitted for Review
                  </div>
                )}
                <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                  Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bento-tile">
            <div className="px-4 py-3.5 border-b border-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">All My Jobs</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {allMyJobs.map((job, i) => (
                <div key={i} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-medium text-slate-800 truncate">{job.equipment}</span>
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <div className="text-xs text-slate-600 truncate">{job.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">Due {job.dueDate}</span>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bento-tile">
            <div className="px-4 py-3.5 border-b border-slate-50">
              <h3 className="text-sm font-semibold text-slate-800">Safety Notices</h3>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FFE5E4', color: '#FF453A' }}>
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">LOTO Required – AE No.2</div>
                  <div className="text-xs text-slate-500 mt-0.5">Lockout/tagout in place. Do not attempt to start engine until clearance given by CE.</div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FFF3DC', color: '#FF9F0A' }}>
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Lifeboat STBD Out of Service</div>
                  <div className="text-xs text-slate-500 mt-0.5">STBD lifeboat under defect repair. PORT lifeboat is primary LSA. Chief Officer informed.</div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EBF2FF', color: '#5B8DEF' }}>
                  <Wrench size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Hot Work Permit Required</div>
                  <div className="text-xs text-slate-500 mt-0.5">Any welding or grinding requires prior approval. Contact Chief Engineer for Hot Work Permit.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
