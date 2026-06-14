import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobPlans } from '../../services/crmService';

export function JobPlansPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');

  const { data: jobPlans, loading, error, reload } = useCrmFetch(
    () => fetchJobPlans(currentVesselId),
    [currentVesselId]
  );

  const filtered = jobPlans.filter(jp =>
    !search ||
    jp.title.toLowerCase().includes(search.toLowerCase()) ||
    jp.code.toLowerCase().includes(search.toLowerCase()) ||
    jp.equipmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-full w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${jobPlans.length} maintenance plans`}
          </p>
        </div>
        {currentRole === 'admin' && (
          <button className="btn-primary"><Plus size={16} />Add Job Plan</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

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
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Plan Code</th><th>Title</th><th>Equipment</th>
                <th>Frequency (days)</th><th>Last Done</th><th>Next Due</th>
                <th>Est. Hours</th><th>Assigned Rank</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(jp => (
                <tr key={jp.id} className="cursor-pointer">
                  <td className="text-xs font-mono text-slate-600">{jp.code || '—'}</td>
                  <td className="text-xs font-medium text-slate-800 max-w-xs">{jp.title}</td>
                  <td className="text-xs text-slate-600 max-w-32 truncate">{jp.equipmentName || '—'}</td>
                  <td className="text-xs font-semibold text-slate-700">{jp.interval || '—'}</td>
                  <td className="text-xs text-slate-600">{jp.lastDone || '—'}</td>
                  <td className="text-xs font-medium text-slate-700">{jp.nextDue || '—'}</td>
                  <td className="text-xs text-slate-600">{jp.estimatedDuration ? `${jp.estimatedDuration}h` : '—'}</td>
                  <td className="text-xs text-slate-600">{jp.responsibleRank || '—'}</td>
                  <td>
                    {currentRole !== 'technician' && (
                      <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">Generate JO</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No job plans found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {jobPlans.length} plans
        </div>
      </div>
    </div>
  );
}
