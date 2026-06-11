import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Ship, Cog, Wrench, AlertTriangle, CheckSquare, Package, Clock, AlertCircle
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { PriorityBadge, SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';

const complianceData = [
  { vessel: 'MAHAKALI', compliance: 82, color: '#F59E0B' },
  { vessel: 'SEALION SPIRIT', compliance: 94, color: '#10B981' },
  { vessel: 'PACIFIC TRADER', compliance: 78, color: '#EF4444' },
  { vessel: 'NORTHERN STAR', compliance: 97, color: '#10B981' },
  { vessel: 'OCEAN PRIDE', compliance: 89, color: '#10B981' },
  { vessel: 'ATLAS VOYAGER', compliance: 91, color: '#10B981' },
  { vessel: 'MERIDIAN QUEEN', compliance: 75, color: '#EF4444' },
  { vessel: 'CORAL WAVE', compliance: 96, color: '#10B981' },
  { vessel: 'STELLAR MARINER', compliance: 88, color: '#10B981' },
];

const upcomingJobs = [
  { vessel: 'MAHAKALI', equipment: 'EMERGENCY GENERATOR', job: 'Monthly Test Run', dueDate: 'Jan 15', priority: 'High', assignedTo: 'Electrician' },
  { vessel: 'MAHAKALI', equipment: 'LIFEBOAT ENGINE NO.2', job: 'Defect Repair', dueDate: 'Jan 12', priority: 'Critical', assignedTo: '3rd Engineer' },
  { vessel: 'SEALION SPIRIT', equipment: 'FIRE PUMP NO.1', job: 'Annual Overhaul', dueDate: 'Jan 14', priority: 'High', assignedTo: '3rd Engineer' },
  { vessel: 'PACIFIC TRADER', equipment: 'MAIN ENGINE', job: 'Top Overhaul – Cyl. 4', dueDate: 'Jan 16', priority: 'Critical', assignedTo: 'Chief Engineer' },
  { vessel: 'NORTHERN STAR', equipment: 'CARGO PUMP NO.1', job: 'Annual Inspection', dueDate: 'Jan 18', priority: 'High', assignedTo: '2nd Engineer' },
  { vessel: 'OCEAN PRIDE', equipment: 'STEERING GEAR', job: 'Quarterly Inspection', dueDate: 'Jan 20', priority: 'High', assignedTo: 'Chief Engineer' },
  { vessel: 'ATLAS VOYAGER', equipment: 'EMERGENCY GENERATOR', job: 'Load Test (Class)', dueDate: 'Jan 22', priority: 'High', assignedTo: 'Electrician' },
];

const pendingApprovals = [
  { type: 'Job Order', title: 'Fire Pump No.1 – Annual Overhaul', vessel: 'MAHAKALI', requestedBy: 'J. Torres', date: 'Jan 9', priority: 'High' },
  { type: 'Job Order', title: 'Emergency Generator Monthly Test', vessel: 'MAHAKALI', requestedBy: 'R. Gupta', date: 'Jan 9', priority: 'High' },
  { type: 'Job Order', title: 'AIS Annual Inspection', vessel: 'MAHAKALI', requestedBy: 'C. Santos', date: 'Jan 8', priority: 'High' },
  { type: 'Spare Request', title: 'M/E Exhaust Valve Spindle × 6', vessel: 'MAHAKALI', requestedBy: 'C. Engineer', date: 'Jan 7', priority: 'Critical' },
  { type: 'Spare Request', title: 'Fuel Injection Nozzle × 6', vessel: 'SEALION SPIRIT', requestedBy: 'K. Pereira', date: 'Jan 7', priority: 'High' },
  { type: 'Defect Update', title: 'Lifeboat Engine No.2 – Critical', vessel: 'MAHAKALI', requestedBy: 'Chief Officer', date: 'Jan 6', priority: 'Critical' },
];

const criticalDefects = [
  { vessel: 'MAHAKALI', equipment: 'LIFEBOAT ENGINE NO.2', severity: 'Critical', desc: 'Engine fails to start – fuel system issue', date: 'Jan 6' },
  { vessel: 'MAHAKALI', equipment: 'CYLINDER UNIT NO.3', severity: 'Critical', desc: 'EGT 45°C above average – engine at reduced load', date: 'Jan 5' },
  { vessel: 'PACIFIC TRADER', equipment: 'LIFEBOAT ENGINE NO.1', severity: 'Critical', desc: 'Engine start battery discharged – replacement required', date: 'Jan 4' },
  { vessel: 'NORTHERN STAR', equipment: 'FIRE PUMP NO.2', severity: 'High', desc: 'Mechanical seal leaking – pump isolated', date: 'Jan 3' },
  { vessel: 'MERIDIAN QUEEN', equipment: 'STEERING GEAR HPU', severity: 'High', desc: 'Hydraulic oil pressure fluctuating below limits', date: 'Jan 2' },
];

const lowStockAlerts = [
  { part: 'M/E Exhaust Valve Spindle', vessel: 'MAHAKALI', qty: 3, min: 6 },
  { part: 'Fuel Injection Nozzle (6S60MC-C)', vessel: 'MAHAKALI', qty: 0, min: 6 },
  { part: 'Radar Transceiver Module FAR-2228', vessel: 'MAHAKALI', qty: 0, min: 1 },
  { part: 'Glow Plug Set – Volvo D4-260', vessel: 'MAHAKALI', qty: 1, min: 2 },
  { part: 'Mechanical Seal – Fire Pump', vessel: 'SEALION SPIRIT', qty: 0, min: 2 },
];

const getComplianceColor = (v: number) => v >= 90 ? '#10B981' : v >= 80 ? '#F59E0B' : '#EF4444';

export function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fleet Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management · 12 vessels · Updated just now</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">11 Jan 2025, 14:32 UTC</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        <StatCard size="sm" label="Total Vessels" value={12} icon={<Ship size={14} />} color="info" />
        <StatCard size="sm" label="Active Vessels" value={10} icon={<Ship size={14} />} color="success" />
        <StatCard size="sm" label="Total Equipment" value="8,420" icon={<Cog size={14} />} />
        <StatCard size="sm" label="Open Job Orders" value={186} icon={<Wrench size={14} />} />
        <StatCard size="sm" label="Overdue Jobs" value={31} icon={<Clock size={14} />} color="danger" />
        <StatCard size="sm" label="Pending Approvals" value={18} icon={<CheckSquare size={14} />} color="warning" />
        <StatCard size="sm" label="Low Stock Spares" value={42} icon={<Package size={14} />} color="warning" />
        <StatCard size="sm" label="Critical Defects" value={7} icon={<AlertCircle size={14} />} color="danger" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left 2/3 */}
        <div className="col-span-2 space-y-5">
          {/* Compliance Chart */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Maintenance Compliance by Vessel</h3>
                <p className="text-xs text-slate-500 mt-0.5">% of scheduled jobs completed on time — last 90 days</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>≥90%</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-500"></div>80–89%</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500"></div>&lt;80%</div>
              </div>
            </div>
            <div className="p-4" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="vessel" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-25} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[60, 100]} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, 'Compliance']}
                    contentStyle={{ fontSize: 12, border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  />
                  <Bar dataKey="compliance" radius={[4, 4, 0, 0]}>
                    {complianceData.map((entry, i) => (
                      <Cell key={i} fill={getComplianceColor(entry.compliance)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Due Work */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Upcoming Due Work</h3>
                <p className="text-xs text-slate-500 mt-0.5">Jobs due within the next 14 days across all vessels</p>
              </div>
              <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Vessel</th>
                    <th>Equipment</th>
                    <th>Job</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingJobs.map((job, i) => (
                    <tr key={i} className="cursor-pointer">
                      <td className="text-xs font-semibold text-slate-700">{job.vessel}</td>
                      <td className="text-xs text-slate-600">{job.equipment}</td>
                      <td className="text-xs text-slate-800 font-medium">{job.job}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">{job.dueDate}</td>
                      <td><PriorityBadge priority={job.priority} /></td>
                      <td className="text-xs text-slate-600">{job.assignedTo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-4">
          {/* Approval Queue */}
          <div className="card">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                Approval Queue
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">18</span>
              </h3>
              <button className="text-xs text-sky-600 font-medium">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingApprovals.map((item, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-medium text-slate-800 leading-tight">{item.title}</div>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">{item.type}</span>
                    <span>{item.vessel}</span>
                    <span>·</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="flex-1 text-xs py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors border border-emerald-200">
                      Approve
                    </button>
                    <button className="flex-1 text-xs py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium transition-colors border border-slate-200">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Defects */}
          <div className="card">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                Critical Defects
                <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">7</span>
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {criticalDefects.map((d, i) => (
                <div key={i} className="px-4 py-2.5">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-semibold text-slate-800 truncate">{d.equipment}</span>
                    <SeverityBadge severity={d.severity} />
                  </div>
                  <div className="text-xs text-slate-500 truncate">{d.vessel} · {d.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alerts */}
          <div className="card">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                Spare Stock Alerts
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">42</span>
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {lowStockAlerts.map((s, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-800 truncate">{s.part}</div>
                    <div className="text-xs text-slate-500">{s.vessel}</div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-sm font-bold ${s.qty === 0 ? 'text-red-600' : 'text-amber-600'}`}>{s.qty}</div>
                    <div className="text-xs text-slate-400">min {s.min}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
