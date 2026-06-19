import React, { useMemo } from 'react';
import { Wrench, Clock, AlertTriangle, Package, CheckCircle, Activity, ClipboardList, AlertCircle, Loader, Gauge, ClipboardCheck, BarChart2, TrendingUp } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { PriorityBadge, SeverityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobOrders, fetchDefects, fetchEquipments, fetchSpareParts, fetchRunningHoursLog, fetchTomForms } from '../../services/crmService';
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

function MonthLabel(monthOffset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

function HoursBar({ current, nextDue, label }: { current: number; nextDue: number; label: string }) {
  const pct = Math.min(100, Math.round((current / nextDue) * 100));
  const color = pct >= 95 ? '#DC2626' : pct >= 85 ? '#D97706' : '#059669';
  const remaining = nextDue - current;
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, marginLeft: 8 }}>
          {pct >= 100 ? 'OVERDUE' : `${remaining.toLocaleString()} hrs left`}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>{current.toLocaleString()} hrs</span>
        <span style={{ fontSize: 10, color, fontWeight: 600 }}>{pct}%</span>
        <span style={{ fontSize: 10, color: '#94A3B8' }}>{nextDue.toLocaleString()} hrs</span>
      </div>
    </div>
  );
}

export function ChiefEngineerDashboard() {
  const { currentVesselId, currentVessel } = useApp();

  const { data: jobOrders, loading: joLoading } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);
  const { data: defects, loading: defLoading } = useCrmFetch(() => fetchDefects(currentVesselId), [currentVesselId]);
  const { data: equipments, loading: eqLoading } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);
  const { data: spares } = useCrmFetch(() => fetchSpareParts(currentVesselId), [currentVesselId]);
  const { data: rhLogs, loading: rhLoading } = useCrmFetch(() => fetchRunningHoursLog(currentVesselId), [currentVesselId]);

  const now = new Date();
  const { data: tomForms, loading: tomLoading } = useCrmFetch(
    () => fetchTomForms(currentVesselId !== '__all__' ? currentVesselId : undefined, now.getMonth() + 1, now.getFullYear()),
    [currentVesselId]
  );

  const loading = joLoading || defLoading || eqLoading || rhLoading || tomLoading;

  const openJOs = jobOrders.filter(jo => jo.status !== 'Completed' && jo.status !== 'Approved');
  const overdueJOs = jobOrders.filter(jo => jo.dueDate && new Date(jo.dueDate) < new Date() && jo.status !== 'Completed' && jo.status !== 'Approved');
  const dueThisWeek = jobOrders.filter(jo => isThisWeek(jo.dueDate) && jo.status !== 'Completed' && jo.status !== 'Approved');
  const completedThisMonth = jobOrders.filter(jo => {
    if (jo.status !== 'Completed' && jo.status !== 'Approved') return false;
    if (!jo.completionDate) return false;
    const d = new Date(jo.completionDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const awaitingReview = jobOrders.filter(jo => jo.status === 'Awaiting Review');
  const openDefects = defects.filter(d => d.status === 'Open' || d.status === 'Under Investigation');
  const criticalDefects = openDefects.filter(d => d.severity === 'Critical');
  const lowStockSpares = spares.filter(sp => sp.qtyOnboard <= sp.minStock && sp.minStock > 0);
  const criticalEq = equipments.filter(e => e.criticality === 'critical' && !e.isGroup).slice(0, 8);

  // Running hours: latest per equipment, filter only those with nextDueHours set
  const latestByEquip: Record<string, number> = {};
  for (const log of rhLogs) {
    if (!log.equipmentId) continue;
    if (!latestByEquip[log.equipmentId] || log.runningHoursReading > latestByEquip[log.equipmentId]) {
      latestByEquip[log.equipmentId] = log.runningHoursReading;
    }
  }
  const rhEquipments = equipments
    .filter(e => !e.isGroup && e.nextDueHours && e.nextDueHours > 0)
    .map(e => ({ ...e, currentHours: latestByEquip[e.id] ?? e.runningHours ?? 0 }))
    .filter(e => e.currentHours > 0)
    .sort((a, b) => {
      const pctA = a.currentHours / (a.nextDueHours ?? 1);
      const pctB = b.currentHours / (b.nextDueHours ?? 1);
      return pctB - pctA;
    })
    .slice(0, 6);

  // TOM Forms: weekly completion summary
  const tomWeeks = ['w1Completed', 'w2Completed', 'w3Completed', 'w4Completed'] as const;
  const tomTotals = tomWeeks.map((w, i) => ({
    week: `W${i + 1}`,
    done: tomForms.filter(f => f[w]).length,
    total: tomForms.length,
  }));

  // 12-month maintenance chart
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const offset = 11 - i;
      const d = new Date();
      d.setMonth(d.getMonth() - offset);
      const m = d.getMonth();
      const y = d.getFullYear();
      const due = jobOrders.filter(jo => {
        if (!jo.dueDate) return false;
        const dd = new Date(jo.dueDate);
        return dd.getMonth() === m && dd.getFullYear() === y;
      }).length;
      const completed = jobOrders.filter(jo => {
        if (!jo.completionDate) return false;
        const dd = new Date(jo.completionDate);
        return dd.getMonth() === m && dd.getFullYear() === y && (jo.status === 'Completed' || jo.status === 'Approved');
      }).length;
      const overdue = jobOrders.filter(jo => {
        if (!jo.dueDate) return false;
        const dd = new Date(jo.dueDate);
        return dd.getMonth() === m && dd.getFullYear() === y && jo.status !== 'Completed' && jo.status !== 'Approved' && dd < new Date();
      }).length;
      return { label: MonthLabel(offset), due, completed, overdue };
    });
  }, [jobOrders]);

  const maxBar = Math.max(...monthlyData.map(d => Math.max(d.due, d.completed, d.overdue)), 1);

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

          {/* TOM Forms + Running Hours row */}
          <div className="grid grid-cols-2 gap-5">
            {/* TOM Forms — current month completion */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-800">TOM Forms — {now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</h3>
                </div>
                <span className="text-xs text-slate-400">{tomForms.length} forms</span>
              </div>
              {tomForms.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">No TOM forms for this month.</div>
              ) : (
                <>
                  <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                    {tomTotals.map(t => {
                      const pct = t.total > 0 ? Math.round((t.done / t.total) * 100) : 0;
                      const color = pct === 100 ? '#059669' : pct >= 75 ? '#4f46e6' : pct >= 50 ? '#D97706' : '#DC2626';
                      return (
                        <div key={t.week} style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', marginTop: 3 }}>{t.week}</div>
                          <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 2 }}>{t.done}/{t.total}</div>
                          <div style={{ height: 3, borderRadius: 99, background: 'rgba(0,0,0,0.06)', marginTop: 6, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="overflow-y-auto divide-y divide-slate-100" style={{ maxHeight: 200 }}>
                    {tomForms.slice(0, 8).map(f => {
                      const done = [f.w1Completed, f.w2Completed, f.w3Completed, f.w4Completed].filter(Boolean).length;
                      const pct = Math.round((done / 4) * 100);
                      return (
                        <div key={f.id} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                            <div style={{ fontSize: 10, color: '#94A3B8' }}>{f.category} · {f.responsibleRank || '—'}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {[f.w1Completed, f.w2Completed, f.w3Completed, f.w4Completed].map((c, i) => (
                              <div key={i} style={{ width: 18, height: 18, borderRadius: 5, background: c ? 'rgba(5,150,105,0.12)' : 'rgba(0,0,0,0.05)', border: `1.5px solid ${c ? '#059669' : 'rgba(0,0,0,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: c ? '#059669' : '#CBD5E1' }}>
                                {c ? '✓' : `W${i + 1}`}
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? '#059669' : pct >= 50 ? '#D97706' : '#DC2626', minWidth: 30, textAlign: 'right' }}>{pct}%</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Running Hours Widget */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge size={14} className="text-indigo-500" />
                  <h3 className="text-sm font-semibold text-slate-800">Running Hours — Service Proximity</h3>
                </div>
                <span className="text-xs text-slate-400">{rhEquipments.length} tracked</span>
              </div>
              {rhEquipments.length === 0 ? (
                <div className="py-10 text-center">
                  <Gauge size={24} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-xs text-slate-400">No service thresholds set.</p>
                  <p className="text-xs text-slate-300 mt-1">Go to Running Hours → Set Threshold to enable.</p>
                </div>
              ) : (
                <div>
                  {rhEquipments.map(eq => (
                    <HoursBar
                      key={eq.id}
                      current={eq.currentHours}
                      nextDue={eq.nextDueHours!}
                      label={eq.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 12-Month Maintenance Analysis */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-800">12-Month Maintenance Analysis</h3>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 2, background: '#4f46e6', display: 'inline-block' }}></span>Jobs Due</span>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 2, background: '#059669', display: 'inline-block' }}></span>Completed</span>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 8, borderRadius: 2, background: '#DC2626', display: 'inline-block' }}></span>Overdue</span>
              </div>
            </div>
            <div style={{ padding: '20px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                {monthlyData.map((m, i) => {
                  const isCurrentMonth = i === 11;
                  return (
                    <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <div style={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-end', height: 100 }}>
                        {[
                          { val: m.due, color: '#4f46e6', opacity: isCurrentMonth ? 1 : 0.65 },
                          { val: m.completed, color: '#059669', opacity: isCurrentMonth ? 1 : 0.65 },
                          { val: m.overdue, color: '#DC2626', opacity: isCurrentMonth ? 1 : 0.65 },
                        ].map((bar, j) => (
                          <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                            {bar.val > 0 && (
                              <div
                                title={`${bar.val}`}
                                style={{
                                  width: '100%',
                                  height: `${Math.max(4, Math.round((bar.val / maxBar) * 100))}%`,
                                  borderRadius: '3px 3px 0 0',
                                  background: bar.color,
                                  opacity: bar.opacity,
                                  transition: 'height 0.3s',
                                  position: 'relative',
                                }}
                              >
                                {bar.val > 0 && (
                                  <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 9, fontWeight: 700, color: bar.color, whiteSpace: 'nowrap' }}>{bar.val}</span>
                                )}
                              </div>
                            )}
                            {bar.val === 0 && <div style={{ width: '100%', height: 2, background: 'rgba(0,0,0,0.04)', borderRadius: 99 }} />}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 9, color: isCurrentMonth ? '#4f46e6' : '#94A3B8', fontWeight: isCurrentMonth ? 700 : 400, letterSpacing: '0.01em', marginTop: 4 }}>{m.label}</span>
                    </div>
                  );
                })}
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
