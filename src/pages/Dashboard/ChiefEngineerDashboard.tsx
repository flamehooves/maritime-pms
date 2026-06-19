import React from 'react';
import { Wrench, Clock, AlertTriangle, Package, CheckCircle, Activity, ClipboardList, AlertCircle, Loader } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { PriorityBadge, SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobOrders, fetchDefects, fetchEquipments, fetchSpareParts } from '../../services/crmService';
import { useApp } from '../../context/AppContext';

const statusDotClass: Record<string, string> = {
  operational: 'bg-emerald-500',
  under_maintenance: 'bg-amber-500',
  defect: 'bg-red-500',
  inactive: 'bg-slate-400',
};

function isThisWeek(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ChiefEngineerDashboard() {
  const { currentVesselId, currentVessel } = useApp();

  const { data: jobOrders, loading: joLoading } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);
  const { data: defects, loading: defLoading } = useCrmFetch(() => fetchDefects(currentVesselId), [currentVesselId]);
  const { data: equipments, loading: eqLoading } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);
  const { data: spares } = useCrmFetch(() => fetchSpareParts(currentVesselId), [currentVesselId]);

  const loading = joLoading || defLoading || eqLoading;

  const openJOs = jobOrders.filter(jo => jo.status !== 'Completed' && jo.status !== 'Approved');
  const overdueJOs = jobOrders.filter(jo => jo.dueDate && new Date(jo.dueDate) < new Date() && jo.status !== 'Completed' && jo.status !== 'Approved');
  const dueThisWeek = jobOrders.filter(jo => isThisWeek(jo.dueDate) && jo.status !== 'Completed' && jo.status !== 'Approved');
  const completedThisMonth = jobOrders.filter(jo => {
    if (jo.status !== 'Completed' && jo.status !== 'Approved') return false;
    if (!jo.completionDate) return false;
    const d = new Date(jo.completionDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const awaitingReview = jobOrders.filter(jo => jo.status === 'Awaiting Review');
  const openDefects = defects.filter(d => d.status === 'Open' || d.status === 'Under Investigation');
  const criticalDefects = openDefects.filter(d => d.severity === 'Critical');
  const lowStockSpares = spares.filter(sp => sp.qtyOnboard <= sp.minStock && sp.minStock > 0);
  const criticalEq = equipments.filter(e => e.criticality === 'critical' && !e.isGroup).slice(0, 8);

  // Group this week's jobs by due date
  const byDate: Record<string, typeof dueThisWeek> = {};
  for (const jo of dueThisWeek) {
    const key = jo.dueDate ?? 'No date';
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(jo);
  }
  const weekGroups = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="p-6 space-y-5 min-h-full w-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{currentVessel.name} — Vessel Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{currentVessel.type} · IMO {currentVessel.imo}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="font-medium text-emerald-700">Vessel Operational</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm">
          <Loader size={16} className="animate-spin" /> Loading dashboard data…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            <StatCard size="sm" label="Equipment" value={equipments.filter(e => !e.isGroup).length} icon={<Activity size={14} />} />
            <StatCard size="sm" label="Due This Week" value={dueThisWeek.length} icon={<ClipboardList size={14} />} color="warning" />
            <StatCard size="sm" label="Overdue" value={overdueJOs.length} icon={<Clock size={14} />} color="danger" />
            <StatCard size="sm" label="Open Job Orders" value={openJOs.length} icon={<Wrench size={14} />} />
            <StatCard size="sm" label="Completed (Month)" value={completedThisMonth.length} icon={<CheckCircle size={14} />} color="success" />
            <StatCard size="sm" label="Low Stock Spares" value={lowStockSpares.length} icon={<Package size={14} />} color="warning" />
            <StatCard size="sm" label="Awaiting Review" value={awaitingReview.length} icon={<Clock size={14} />} />
            <StatCard size="sm" label="Critical Defects" value={criticalDefects.length} icon={<AlertCircle size={14} />} color="danger" />
          </div>

          <div className="grid grid-cols-3 gap-5">
            {/* Jobs This Week */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-800">Jobs Due This Week</h3>
                <p className="text-xs text-slate-500 mt-0.5">{dueThisWeek.length} job order{dueThisWeek.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                {dueThisWeek.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No jobs due this week.</div>
                ) : weekGroups.map(([date, jos]) => (
                  <div key={date}>
                    <div className="px-4 py-2 bg-slate-50 border-y border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">{formatDate(date)}</span>
                    </div>
                    {jos.map((jo) => (
                      <div key={jo.id} className="px-4 py-2.5 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-800 truncate">{jo.equipmentName}</span>
                          <PriorityBadge priority={jo.priority} />
                        </div>
                        <div className="text-xs text-slate-600">{jo.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <span>{jo.assignedTo || '—'}</span>
                          <span className="ml-auto"><StatusBadge status={jo.status} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Open Job Orders */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Open Job Orders</h3>
                <span className="text-xs font-semibold text-sky-600">{openJOs.length} total</span>
              </div>
              <div className="px-4 py-3 border-b border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-800">{openJOs.filter(jo => jo.status === 'Not Started').length}</div>
                  <div className="text-xs text-slate-500">Not Started</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-sky-600">{openJOs.filter(jo => jo.status === 'In Progress').length}</div>
                  <div className="text-xs text-slate-500">In Progress</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">{openJOs.filter(jo => jo.status === 'Awaiting Review').length}</div>
                  <div className="text-xs text-slate-500">Awaiting Review</div>
                </div>
              </div>
              <div className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: '320px' }}>
                {openJOs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">No open job orders.</div>
                ) : openJOs.slice(0, 10).map((jo) => (
                  <div key={jo.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-500">{jo.joNumber}</span>
                      <PriorityBadge priority={jo.priority} />
                    </div>
                    <div className="text-xs font-medium text-slate-800 mb-1 truncate">{jo.equipmentName} — {jo.title}</div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={jo.status} />
                      <span className="text-xs text-slate-400">Due {formatDate(jo.dueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Equipment */}
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <div className="px-4 py-3.5 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Critical Equipment Status</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {criticalEq.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No critical equipment found.</div>
                  ) : criticalEq.map((eq) => (
                    <div key={eq.id} className="px-4 py-2.5 flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotClass[eq.status ?? 'operational'] ?? 'bg-slate-400'}`}></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-800 truncate">{eq.name}</div>
                        <div className="text-xs text-slate-500">#{eq.code} · {eq.location || eq.system || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Open Defects */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  Open Defects
                  {openDefects.length > 0 && <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{openDefects.length}</span>}
                </h3>
              </div>
              {openDefects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No open defects. 🎉</div>
              ) : (
                <table className="w-full data-table">
                  <thead>
                    <tr><th>Defect ID</th><th>Equipment</th><th>Severity</th><th>Description</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {openDefects.slice(0, 8).map((d) => (
                      <tr key={d.id} className="cursor-pointer">
                        <td className="text-xs font-mono text-slate-600">{d.defectId}</td>
                        <td className="text-xs font-medium text-slate-800">{d.equipmentName}</td>
                        <td><SeverityBadge severity={d.severity} /></td>
                        <td className="text-xs text-slate-600 max-w-xs truncate">{d.description}</td>
                        <td className="text-xs text-slate-500">{formatDate(d.reportedDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Low Stock Spares */}
            <div className="card">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  Low / Out of Stock Spares
                  {lowStockSpares.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full">{lowStockSpares.length}</span>}
                </h3>
              </div>
              {lowStockSpares.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">All spare stocks are sufficient.</div>
              ) : (
                <table className="w-full data-table">
                  <thead>
                    <tr><th>Part No.</th><th>Description</th><th>On Board</th><th>Min Stock</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {lowStockSpares.slice(0, 8).map((sp) => (
                      <tr key={sp.id}>
                        <td className="text-xs font-mono text-slate-600">{sp.partNumber}</td>
                        <td className="text-xs font-medium text-slate-800 max-w-xs truncate">{sp.description}</td>
                        <td className="text-xs font-bold" style={{ color: sp.qtyOnboard === 0 ? '#DC2626' : '#D97706' }}>{sp.qtyOnboard}</td>
                        <td className="text-xs text-slate-500">{sp.minStock}</td>
                        <td><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sp.qtyOnboard === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{sp.qtyOnboard === 0 ? 'Out of Stock' : 'Low Stock'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
