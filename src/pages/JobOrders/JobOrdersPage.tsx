import React, { useState } from 'react';
import { Plus, Search, Loader, AlertCircle } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobOrders } from '../../services/crmService';

export function JobOrdersPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: jobOrders, loading, error, reload } = useCrmFetch(
    () => fetchJobOrders(currentVesselId),
    [currentVesselId]
  );

  const statuses = ['All', 'Not Started', 'In Progress', 'On Hold', 'Awaiting Review', 'Approved', 'Completed'];

  const filtered = jobOrders.filter(jo => {
    const matchSearch = !search ||
      jo.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      jo.title.toLowerCase().includes(search.toLowerCase()) ||
      jo.joNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || jo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: jobOrders.length,
    inProgress: jobOrders.filter(j => j.status === 'In Progress').length,
    awaitingReview: jobOrders.filter(j => j.status === 'Awaiting Review').length,
    overdue: jobOrders.filter(j => j.status === 'Not Started' && j.dueDate && new Date(j.dueDate) < new Date()).length,
  };

  return (
    <div className="p-6 min-h-full w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${jobOrders.length} work orders`}
          </p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary"><Plus size={16} />Create Job Order</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-900' },
          { label: 'In Progress', value: counts.inProgress, color: 'text-sky-700' },
          { label: 'Awaiting Review', value: counts.awaitingReview, color: 'text-purple-700' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search job orders..."
            className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>JO Number</th><th>Equipment</th><th>Job Title</th>
                  <th>Priority</th><th>Due Date</th><th>Assigned To</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(jo => (
                  <tr key={jo.id} className="cursor-pointer">
                    <td className="text-xs font-mono font-semibold text-sky-700">{jo.joNumber}</td>
                    <td className="text-xs font-medium text-slate-800">{jo.equipmentName || '—'}</td>
                    <td className="text-xs text-slate-700 max-w-48 truncate">{jo.title}</td>
                    <td><PriorityBadge priority={jo.priority} /></td>
                    <td className={`text-xs ${jo.dueDate && new Date(jo.dueDate) < new Date() && jo.status !== 'Completed' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                      {jo.dueDate || '—'}
                    </td>
                    <td className="text-xs text-slate-600">{jo.assignedTo || '—'}</td>
                    <td><StatusBadge status={jo.status} /></td>
                    <td>
                      <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">View</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No job orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {filtered.length} of {jobOrders.length} job orders
        </div>
      </div>
    </div>
  );
}
