import React, { useState } from 'react';
import { Clock, CheckCircle, AlertTriangle, Play, Pause, ChevronRight, Wrench } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';

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

export function TechnicianDashboard() {
  const [activeJob, setActiveJob] = useState<string | null>(null);

  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Good morning, John.</h1>
          <p className="text-sm text-slate-500 mt-0.5">Saturday, 11 January 2025 · MAHAKALI · Singapore Anchorage</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-slate-200 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs text-slate-500 mb-1">Assigned Jobs</div>
          <div className="text-2xl font-bold text-slate-900">9</div>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', background: '#FFF5F5' }}>
          <div className="text-xs text-red-600 mb-1">Due Today</div>
          <div className="text-2xl font-bold text-red-700">3</div>
        </div>
        <div className="bg-white rounded-lg border border-sky-200 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', background: '#F0F9FF' }}>
          <div className="text-xs text-sky-600 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-sky-700">2</div>
        </div>
        <div className="bg-white rounded-lg border border-purple-200 p-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)', background: '#FAF5FF' }}>
          <div className="text-xs text-purple-600 mb-1">Awaiting Review</div>
          <div className="text-2xl font-bold text-purple-700">4</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Today's Priority Jobs */}
        <div className="col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Today's Priority Jobs</h2>
          {myJobs.map((job) => (
            <div
              key={job.joNumber}
              className={`bg-white rounded-xl border p-4 transition-all ${
                job.priority === 'Critical' ? 'border-red-200 shadow-sm' : 'border-slate-200'
              }`}
              style={{ boxShadow: job.priority === 'Critical' ? '0 0 0 2px rgba(239,68,68,0.08)' : '0 1px 3px rgba(0,0,0,0.05)' }}
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
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${job.progress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {job.status === 'Not Started' && (
                  <button
                    onClick={() => setActiveJob(job.joNumber)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Play size={14} />
                    Start Work
                  </button>
                )}
                {job.status === 'In Progress' && (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors">
                      <CheckCircle size={14} />
                      Complete
                    </button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      <Pause size={14} />
                    </button>
                  </>
                )}
                {job.status === 'Awaiting Review' && (
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium rounded-lg">
                    <CheckCircle size={14} />
                    Submitted for Review
                  </div>
                )}
                <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                  Details <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="card">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">All My Jobs</h3>
            </div>
            <div className="divide-y divide-slate-100">
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

          <div className="card">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Safety Notices</h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-red-50 text-red-600 flex-shrink-0">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">LOTO Required – AE No.2</div>
                  <div className="text-xs text-slate-500 mt-0.5">Lockout/tagout in place. Do not attempt to start engine until clearance given by CE.</div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-50 text-amber-600 flex-shrink-0">
                  <AlertTriangle size={14} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Lifeboat STBD Out of Service</div>
                  <div className="text-xs text-slate-500 mt-0.5">STBD lifeboat under defect repair. PORT lifeboat is primary LSA. Chief Officer informed.</div>
                </div>
              </div>
              <div className="px-4 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-sky-50 text-sky-600 flex-shrink-0">
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
