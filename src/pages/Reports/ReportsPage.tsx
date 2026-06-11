import React from 'react';
import { BarChart3, FileText, Clock, Package, AlertTriangle, Ship, Activity, Download } from 'lucide-react';

const reports = [
  {
    icon: BarChart3, title: 'Maintenance Compliance Report',
    desc: 'Vessel-by-vessel compliance summary with overdue job analysis, completion trends, and compliance scoring.',
    lastGenerated: 'Jan 10, 2025', category: 'Compliance', color: 'text-sky-600 bg-sky-50'
  },
  {
    icon: Clock, title: 'Due Jobs Report',
    desc: 'All scheduled maintenance jobs due within a selected date range, grouped by vessel and priority.',
    lastGenerated: 'Jan 9, 2025', category: 'Planning', color: 'text-amber-600 bg-amber-50'
  },
  {
    icon: AlertTriangle, title: 'Overdue Jobs Report',
    desc: 'Critical view of all past-due maintenance items with overdue duration and risk classification.',
    lastGenerated: 'Jan 8, 2025', category: 'Compliance', color: 'text-red-600 bg-red-50'
  },
  {
    icon: Package, title: 'Spare Consumption Report',
    desc: 'Inventory movement, consumption trends, and spare utilisation by vessel, system and equipment.',
    lastGenerated: 'Jan 5, 2025', category: 'Inventory', color: 'text-emerald-600 bg-emerald-50'
  },
  {
    icon: Activity, title: 'Critical Equipment Report',
    desc: 'Status summary of all critical and class-mandatory equipment with maintenance currency and defect status.',
    lastGenerated: 'Jan 7, 2025', category: 'Safety', color: 'text-red-600 bg-red-50'
  },
  {
    icon: AlertTriangle, title: 'Defect Report',
    desc: 'Open defect register with severity classification, age analysis, and linked corrective work order status.',
    lastGenerated: 'Jan 6, 2025', category: 'Safety', color: 'text-orange-600 bg-orange-50'
  },
  {
    icon: Ship, title: 'Vessel Maintenance Summary',
    desc: 'Complete maintenance history for a selected vessel and reporting period — suitable for port state control.',
    lastGenerated: 'Dec 31, 2024', category: 'Vessel', color: 'text-slate-600 bg-slate-100'
  },
  {
    icon: BarChart3, title: 'Fleet Health Report',
    desc: 'Executive summary of fleet-wide maintenance performance, compliance scoring, and risk indicators.',
    lastGenerated: 'Jan 1, 2025', category: 'Fleet', color: 'text-sky-600 bg-sky-50'
  },
];

const categoryColors: Record<string, string> = {
  Compliance: 'bg-sky-100 text-sky-700',
  Planning: 'bg-amber-100 text-amber-700',
  Inventory: 'bg-emerald-100 text-emerald-700',
  Safety: 'bg-red-100 text-red-700',
  Vessel: 'bg-slate-100 text-slate-700',
  Fleet: 'bg-purple-100 text-purple-700',
};

export function ReportsPage() {
  return (
    <div className="p-6 min-h-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate operational and compliance reports for fleet management</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="card p-5 hover:border-sky-200 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${r.color}`}>
                <r.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                  <span className={`badge flex-shrink-0 ${categoryColors[r.category] || 'bg-slate-100 text-slate-600'}`}>{r.category}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Last generated: {r.lastGenerated}</span>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download size={13} />Generate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
