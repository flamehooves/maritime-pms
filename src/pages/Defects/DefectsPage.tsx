import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { defects } from '../../data/defects';
import { SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';

export function DefectsPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const counts = {
    critical: defects.filter(d => d.severity === 'Critical').length,
    high: defects.filter(d => d.severity === 'High').length,
    medium: defects.filter(d => d.severity === 'Medium').length,
    open: defects.filter(d => d.status === 'Open' || d.status === 'Under Investigation').length,
  };

  const filtered = defects.filter(d => {
    const matchSearch = !search || d.equipmentName.toLowerCase().includes(search.toLowerCase()) || d.defectId.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'All' || d.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Defect Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">MAHAKALI · {defects.length} recorded defects</p>
        </div>
        <button className="btn-primary"><Plus size={16} />Report Defect</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Open Defects', value: counts.open, cls: 'text-slate-900' },
          { label: 'Critical', value: counts.critical, cls: 'text-red-700' },
          { label: 'High Severity', value: counts.high, cls: 'text-orange-700' },
          { label: 'Medium', value: counts.medium, cls: 'text-amber-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xl font-bold mt-1 ${s.cls}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search defects..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
            <button key={s} onClick={() => setSeverityFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${severityFilter === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Defect ID</th><th>Equipment</th><th>System</th><th>Severity</th>
              <th>Description</th><th>Reported By</th><th>Date</th><th>Status</th><th>Linked JO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="cursor-pointer">
                <td className="text-xs font-mono font-semibold text-slate-700">{d.defectId}</td>
                <td>
                  <div className="text-xs font-medium text-slate-800">{d.equipmentName}</div>
                  <div className="text-xs text-slate-400 font-mono">{d.equipmentCode}</div>
                </td>
                <td className="text-xs text-slate-500 max-w-24 truncate">{d.system}</td>
                <td><SeverityBadge severity={d.severity} /></td>
                <td className="text-xs text-slate-700 max-w-64 truncate" title={d.description}>{d.description}</td>
                <td className="text-xs text-slate-600">{d.reportedBy}</td>
                <td className="text-xs text-slate-600">{d.reportedDate}</td>
                <td><StatusBadge status={d.status} /></td>
                <td className="text-xs font-mono text-sky-600">{d.linkedJobOrderNumber || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">{filtered.length} of {defects.length} defects</div>
      </div>
    </div>
  );
}
