import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { jobPlans } from '../../data/jobPlans';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';

export function JobPlansPage() {
  const { currentRole } = useApp();
  const [search, setSearch] = useState('');

  const filtered = jobPlans.filter(jp =>
    !search ||
    jp.title.toLowerCase().includes(search.toLowerCase()) ||
    jp.code.toLowerCase().includes(search.toLowerCase()) ||
    jp.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">MAHAKALI · {jobPlans.length} maintenance plans</p>
        </div>
        {currentRole === 'admin' && (
          <button className="btn-primary"><Plus size={16} />Add Job Plan</button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search plans..."
            className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Plan Code</th><th>Title</th><th>Equipment</th><th>System</th>
              <th>Frequency</th><th>Interval</th><th>Last Done</th><th>Next Due</th>
              <th>Est. Hours</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(jp => (
              <tr key={jp.id} className="cursor-pointer">
                <td className="text-xs font-mono text-slate-600">{jp.code}</td>
                <td className="text-xs font-medium text-slate-800 max-w-xs">{jp.title}</td>
                <td className="text-xs text-slate-600 max-w-32 truncate">{jp.equipmentName}</td>
                <td className="text-xs text-slate-500 max-w-28 truncate">{jp.system}</td>
                <td className="text-xs text-slate-600">{jp.frequencyType}</td>
                <td className="text-xs font-semibold text-slate-700">{jp.interval} {jp.intervalUnit}</td>
                <td className="text-xs text-slate-600">{jp.lastDone || '—'}</td>
                <td className={`text-xs font-medium ${jp.status === 'Overdue' ? 'text-red-600' : jp.status === 'Due Soon' ? 'text-amber-600' : 'text-slate-700'}`}>
                  {jp.nextDue || '—'}
                </td>
                <td className="text-xs text-slate-600">{jp.estimatedDuration}h</td>
                <td><StatusBadge status={jp.status} /></td>
                <td>
                  {currentRole !== 'technician' && (
                    <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">Generate JO</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {jobPlans.length} plans
        </div>
      </div>
    </div>
  );
}
