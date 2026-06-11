import React from 'react';
import { Wrench, Clock, AlertTriangle, Package, CheckCircle, Activity, ClipboardList, AlertCircle } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { PriorityBadge, SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';

const weeklyJobs = [
  { day: 'Mon 13 Jan', jobs: [
    { equipment: 'EMERGENCY GENERATOR', title: 'Monthly Test Run', priority: 'High', assignedTo: 'Electrician', hours: 1, status: 'Not Started' },
    { equipment: 'LIFEBOAT ENGINE NO.2', title: 'Defect Repair', priority: 'Critical', assignedTo: '3rd Engineer', hours: 4, status: 'Not Started' },
  ]},
  { day: 'Tue 14 Jan', jobs: [
    { equipment: 'AUX ENGINE NO.1', title: 'Lube Oil Change', priority: 'Medium', assignedTo: '2nd Engineer', hours: 2, status: 'Not Started' },
  ]},
  { day: 'Wed 15 Jan', jobs: [
    { equipment: 'CYLINDER UNIT NO.3', title: 'Top Overhaul (cont.)', priority: 'Critical', assignedTo: 'Chief Engineer', hours: 8, status: 'In Progress' },
    { equipment: 'TURBOCHARGER', title: 'Annual Overhaul', priority: 'High', assignedTo: 'Chief Engineer', hours: 8, status: 'Not Started' },
    { equipment: 'M/E FUEL INJ. VALVE', title: 'Overhaul – All Units', priority: 'High', assignedTo: '2nd Engineer', hours: 4, status: 'On Hold' },
  ]},
  { day: 'Thu 16 Jan', jobs: [
    { equipment: 'FIRE PUMP NO.1 & 2', title: 'Weekly Test Run', priority: 'High', assignedTo: '3rd Engineer', hours: 1, status: 'Not Started' },
  ]},
  { day: 'Fri 17 Jan', jobs: [
    { equipment: 'GMDSS CONSOLE', title: 'Battery Test', priority: 'Medium', assignedTo: 'GMDSS Officer', hours: 1, status: 'Not Started' },
  ]},
];

const openJobOrders = [
  { joNumber: 'JO-2025-0042', equipment: 'CYLINDER UNIT NO.3', priority: 'Critical', dueDate: 'Jan 15', assignedTo: 'Ch. Engineer', status: 'In Progress', progress: 50 },
  { joNumber: 'JO-2025-0041', equipment: 'AUX ENGINE NO.2', priority: 'High', dueDate: 'Jan 8', assignedTo: '2nd Engineer', status: 'In Progress', progress: 60 },
  { joNumber: 'JO-2025-0039', equipment: 'FIRE PUMP NO.1', priority: 'High', dueDate: 'Jan 10', assignedTo: '3rd Engineer', status: 'Awaiting Review', progress: 100 },
  { joNumber: 'JO-2025-0038', equipment: 'LIFEBOAT ENG. NO.2', priority: 'Critical', dueDate: 'Jan 12', assignedTo: '3rd Engineer', status: 'Not Started', progress: 0 },
  { joNumber: 'JO-2025-0036', equipment: 'EMERGENCY GENERATOR', priority: 'High', dueDate: 'Jan 15', assignedTo: 'Electrician', status: 'Awaiting Review', progress: 100 },
  { joNumber: 'JO-2025-0037', equipment: 'TURBOCHARGER', priority: 'High', dueDate: 'Jan 15', assignedTo: 'Ch. Engineer', status: 'Not Started', progress: 0 },
];

const criticalEquipment = [
  { code: '310.01', name: 'MAIN ENGINE', status: 'under_maintenance', note: 'Cyl. 3 under overhaul' },
  { code: '320.02', name: 'AUX ENGINE NO.2', status: 'under_maintenance', note: 'Top overhaul in progress' },
  { code: '520.05', name: 'LIFEBOAT ENG. NO.2', status: 'defect', note: 'Defect – start failure' },
  { code: '310.01.03', name: 'CYLINDER UNIT NO.3', status: 'under_maintenance', note: 'JO-2025-0042 open' },
  { code: '410.04', name: 'EMERGENCY GENERATOR', status: 'operational', note: 'Monthly test due Jan 15' },
  { code: '430.01', name: 'STEERING GEAR', status: 'operational', note: 'Quarterly check Jan 30' },
  { code: '520.01', name: 'FIRE PUMP NO.1', status: 'operational', note: 'Overhaul completed' },
  { code: '410.01', name: 'DG NO.1', status: 'operational', note: 'Running normally' },
];

const openDefects = [
  { id: 'DEF-2025-001', equipment: 'LIFEBOAT ENG. NO.2', severity: 'Critical', desc: 'Engine start failure', date: 'Jan 6' },
  { id: 'DEF-2025-002', equipment: 'CYLINDER UNIT NO.3', severity: 'Critical', desc: 'EGT 45°C above avg', date: 'Jan 5' },
  { id: 'DEF-2025-003', equipment: 'MOORING WINCH NO.3', severity: 'High', desc: 'Brake slippage', date: 'Jan 4' },
  { id: 'DEF-2025-004', equipment: 'AUX ENGINE NO.2', severity: 'High', desc: 'Cylinder liner worn', date: 'Jan 8' },
  { id: 'DEF-2024-048', equipment: 'HFO SUPPLY PUMP', severity: 'High', desc: 'Shaft seal weeping', date: 'Dec 28' },
];

const recentActivity = [
  { icon: '✓', text: 'Fire Pump No.1 overhaul completed — J. Torres', time: '2h ago', color: 'text-emerald-600 bg-emerald-50' },
  { icon: '!', text: 'Defect DEF-2025-004 raised — AE No.2 liner worn', time: '4h ago', color: 'text-red-600 bg-red-50' },
  { icon: '→', text: 'JO-2025-0042 status updated to In Progress', time: '6h ago', color: 'text-sky-600 bg-sky-50' },
  { icon: '✓', text: 'GMDSS Battery Test completed and approved', time: '1d ago', color: 'text-emerald-600 bg-emerald-50' },
  { icon: '📦', text: 'Spare request for Exhaust Valve Spindles × 6 submitted', time: '1d ago', color: 'text-amber-600 bg-amber-50' },
  { icon: '!', text: 'Defect DEF-2025-001 – Lifeboat stbd engine start failure', time: '2d ago', color: 'text-red-600 bg-red-50' },
];

const statusDotClass: Record<string, string> = {
  operational: 'bg-emerald-500',
  under_maintenance: 'bg-amber-500',
  defect: 'bg-red-500',
  inactive: 'bg-slate-400',
};

export function ChiefEngineerDashboard() {
  return (
    <div className="p-6 space-y-5 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">MAHAKALI — Vessel Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bulk Carrier · IMO 9876543 · Currently at Singapore anchorage</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-emerald-700">Vessel Operational</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        <StatCard size="sm" label="Equipment" value={684} icon={<Activity size={14} />} />
        <StatCard size="sm" label="Due This Week" value={14} icon={<ClipboardList size={14} />} color="warning" />
        <StatCard size="sm" label="Overdue" value={8} icon={<Clock size={14} />} color="danger" />
        <StatCard size="sm" label="Open Job Orders" value={26} icon={<Wrench size={14} />} />
        <StatCard size="sm" label="Completed (Month)" value={32} icon={<CheckCircle size={14} />} color="success" />
        <StatCard size="sm" label="Low Stock Spares" value={5} icon={<Package size={14} />} color="warning" />
        <StatCard size="sm" label="Pending Updates" value={6} icon={<Clock size={14} />} />
        <StatCard size="sm" label="Critical Defects" value={2} icon={<AlertCircle size={14} />} color="danger" />
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Col 1: Jobs This Week */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Jobs Due This Week</h3>
            <p className="text-xs text-slate-500 mt-0.5">13–17 January 2025</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
            {weeklyJobs.map((dayGroup) => (
              <div key={dayGroup.day}>
                <div className="px-4 py-2 bg-slate-50 border-y border-slate-100">
                  <span className="text-xs font-semibold text-slate-600">{dayGroup.day}</span>
                </div>
                {dayGroup.jobs.map((job, i) => (
                  <div key={i} className="px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-800 truncate">{job.equipment}</span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <div className="text-xs text-slate-600">{job.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>{job.assignedTo}</span>
                      <span>·</span>
                      <span>{job.hours}h est.</span>
                      <span className="ml-auto"><StatusBadge status={job.status} /></span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Open Job Orders */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Open Job Orders</h3>
            <span className="text-xs font-semibold text-sky-600">26 total</span>
          </div>
          <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-slate-800">8</div>
              <div className="text-xs text-slate-500">Not Started</div>
            </div>
            <div>
              <div className="text-lg font-bold text-sky-600">4</div>
              <div className="text-xs text-slate-500">In Progress</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">4</div>
              <div className="text-xs text-slate-500">Awaiting Review</div>
            </div>
          </div>
          <div className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: '320px' }}>
            {openJobOrders.map((jo, i) => (
              <div key={i} className="px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{jo.joNumber}</span>
                  <PriorityBadge priority={jo.priority} />
                </div>
                <div className="text-xs font-medium text-slate-800 mb-1">{jo.equipment}</div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={jo.status} />
                  <span className="text-xs text-slate-400">Due {jo.dueDate}</span>
                </div>
                {jo.status === 'In Progress' && (
                  <div className="mt-2">
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${jo.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Equipment Health */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Critical Equipment Status</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {criticalEquipment.map((eq, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotClass[eq.status] || 'bg-slate-400'}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-800 truncate">{eq.name}</div>
                    <div className="text-xs text-slate-500 truncate">{eq.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-5">
        {/* Open Defects */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Open Defects
              <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">7</span>
            </h3>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr><th>Defect ID</th><th>Equipment</th><th>Severity</th><th>Description</th><th>Date</th></tr>
            </thead>
            <tbody>
              {openDefects.map((d, i) => (
                <tr key={i} className="cursor-pointer">
                  <td className="text-xs font-mono text-slate-600">{d.id}</td>
                  <td className="text-xs font-medium text-slate-800">{d.equipment}</td>
                  <td><SeverityBadge severity={d.severity} /></td>
                  <td className="text-xs text-slate-600 max-w-xs truncate">{d.desc}</td>
                  <td className="text-xs text-slate-500">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Recent Maintenance Activity</h3>
          </div>
          <div className="p-4 space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${a.color}`}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-700">{a.text}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
