import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { jobOrders } from '../../data/jobOrders';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';

export function JobOrdersPage() {
  const { currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Not Started', 'In Progress', 'On Hold', 'Awaiting Review', 'Approved', 'Completed'];

  const filtered = jobOrders.filter(jo => {
    const matchSearch = !search || jo.equipmentName.toLowerCase().includes(search.toLowerCase()) || jo.title.toLowerCase().includes(search.toLowerCase()) || jo.joNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || jo.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: jobOrders.length,
    inProgress: jobOrders.filter(j => j.status === 'In Progress').length,
    awaitingReview: jobOrders.filter(j => j.status === 'Awaiting Review').length,
    overdue: jobOrders.filter(j => j.status === 'Not Started' && new Date(j.dueDate) < new Date()).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Job Orders</h1>
          <p className="text-sm text-slate-500 mt-0.5">MAHAKALI · {jobOrders.length} work orders</p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary"><Plus size={16} />Create Job Order</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Open', value: counts.total, color: 'text-slate-900' },
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

      {/* Filters */}
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

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>JO Number</th>
                <th>Equipment</th>
                <th>System</th>
                <th>Job Title</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Approval</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(jo => (
                <tr key={jo.id} className="cursor-pointer">
                  <td className="text-xs font-mono font-semibold text-sky-700">{jo.joNumber}</td>
                  <td>
                    <div className="text-xs font-medium text-slate-800">{jo.equipmentName}</div>
                    <div className="text-xs text-slate-400 font-mono">{jo.equipmentCode}</div>
                  </td>
                  <td className="text-xs text-slate-600 max-w-24 truncate">{jo.system}</td>
                  <td className="text-xs text-slate-700 max-w-48 truncate">{jo.title}</td>
                  <td><PriorityBadge priority={jo.priority} /></td>
                  <td className={`text-xs ${new Date(jo.dueDate) < new Date() && jo.status !== 'Approved' && jo.status !== 'Completed' ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>{jo.dueDate}</td>
                  <td className="text-xs text-slate-600">{jo.assignedTo}</td>
                  <td><StatusBadge status={jo.status} /></td>
                  <td>{jo.approvalStatus && jo.approvalStatus !== 'N/A' ? <StatusBadge status={jo.approvalStatus} /> : <span className="text-xs text-slate-400">—</span>}</td>
                  <td>
                    <button className="text-xs text-sky-600 hover:text-sky-700 font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing {filtered.length} of {jobOrders.length} job orders
        </div>
      </div>
    </div>
  );
}
