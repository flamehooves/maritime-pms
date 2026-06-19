import React from 'react';
import { Clock, CheckCircle, AlertTriangle, Play, Pause, ChevronRight, Wrench, Loader } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobOrders, fetchEquipments } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import type { Equipment } from '../../types';

const statusConfig = {
  operational:       { bg: '#DCFCE7', color: '#34C759' },
  under_maintenance: { bg: '#eef2ff', color: '#FF9F0A' },
  defect:            { bg: '#FFE5E4', color: '#FF453A' },
  inactive:          { bg: '#F3F4F6', color: '#9CA3AF' },
};

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr).toDateString();
  return d === new Date().toDateString();
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function EquipmentHeatmap({ equipments }: { equipments: Equipment[] }) {
  const allEquipment = equipments.filter(e => !e.isGroup);
  const bySystem: Record<string, Equipment[]> = {};
  for (const eq of allEquipment) {
    const sys = eq.system ?? 'General';
    if (!bySystem[sys]) bySystem[sys] = [];
    bySystem[sys].push(eq);
  }

  return (
    <div className="bento-tile p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Equipment Health Overview</h3>
        <p className="text-xs text-slate-500 mt-0.5">Live equipment status from CRM — hover for details</p>
      </div>
      {allEquipment.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">No equipment found in CRM.</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(bySystem).map(([system, eqs]) => (
            <div key={system}>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{system}</div>
              <div className="flex flex-wrap gap-1.5">
                {eqs.map(eq => {
                  const status = eq.status ?? 'operational';
                  const cfg = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.operational;
                  return (
                    <div
                      key={eq.id}
                      title={`#${eq.code} ${eq.name}\nStatus: ${status}`}
                      className="rounded-md cursor-pointer transition-all hover:scale-110"
                      style={{ width: '20px', height: '20px', background: cfg.bg, border: `2px solid ${cfg.color}`, flexShrink: 0 }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        {[
          { label: 'Operational', color: '#34C759', bg: '#DCFCE7' },
          { label: 'Maintenance', color: '#FF9F0A', bg: '#eef2ff' },
          { label: 'Defect', color: '#FF453A', bg: '#FFE5E4' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: item.bg, border: `2px solid ${item.color}` }}></div>
            <span className="text-xs text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechnicianDashboard() {
  const { currentVesselId, currentVessel } = useApp();

  const { data: jobOrders, loading: joLoading } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);
  const { data: equipments, loading: eqLoading } = useCrmFetch(() => fetchEquipments(currentVesselId), [currentVesselId]);

  const loading = joLoading || eqLoading;

  const openJOs = jobOrders.filter(jo => jo.status !== 'Completed' && jo.status !== 'Approved');
  const todayJOs = openJOs.filter(jo => isToday(jo.dueDate));
  const inProgress = openJOs.filter(jo => jo.status === 'In Progress');
  const awaitingReview = openJOs.filter(jo => jo.status === 'Awaiting Review');

  const todayPriority = todayJOs.sort((a, b) => {
    const p = ['Critical', 'High', 'Medium', 'Low'];
    return p.indexOf(a.priority) - p.indexOf(b.priority);
  }).slice(0, 3);

  return (
    <div className="p-6 space-y-5 min-h-full w-full" style={{ background: '#F5F5F7' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good morning.</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}{currentVessel.name}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-400 text-sm">
          <Loader size={16} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-xs text-slate-500 mb-1 font-medium">Assigned Jobs</div>
              <div className="text-2xl font-bold text-slate-900">{openJOs.length}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#FFE5E4', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#FF453A' }}>Due Today</div>
              <div className="text-2xl font-bold" style={{ color: '#CC1100' }}>{todayJOs.length}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#EBF2FF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#5B8DEF' }}>In Progress</div>
              <div className="text-2xl font-bold" style={{ color: '#1D4ED8' }}>{inProgress.length}</div>
            </div>
            <div className="rounded-2xl p-4" style={{ background: '#F3E8FF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="text-xs font-medium mb-1" style={{ color: '#BF5AF2' }}>Awaiting Review</div>
              <div className="text-2xl font-bold" style={{ color: '#7C3AED' }}>{awaitingReview.length}</div>
            </div>
          </div>

          <EquipmentHeatmap equipments={equipments} />

          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Today's Priority Jobs</h2>
              {todayPriority.length === 0 ? (
                <div className="rounded-2xl p-8 text-center" style={{ background: '#FFFFFF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No jobs due today!</p>
                  <p className="text-xs text-slate-400 mt-1">Check the full job list for upcoming work.</p>
                </div>
              ) : todayPriority.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl p-4 transition-all"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: job.priority === 'Critical'
                      ? '0 2px 12px rgba(255,69,58,0.12), 0 0 0 1px rgba(255,69,58,0.15)'
                      : '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={job.priority} />
                        <span className="text-xs font-mono text-slate-400">{job.joNumber}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{job.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{job.equipmentName} · {job.system}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <StatusBadge status={job.status} />
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-end">
                        <Clock size={11} />
                        Due {formatDate(job.dueDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.status === 'Not Started' && (
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white text-sm font-medium rounded-xl transition-colors" style={{ background: '#5B8DEF' }}>
                        <Play size={14} />Start Work
                      </button>
                    )}
                    {job.status === 'In Progress' && (
                      <>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-white text-sm font-medium rounded-xl transition-colors" style={{ background: '#5B8DEF' }}>
                          <CheckCircle size={14} />Complete
                        </button>
                        <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors">
                          <Pause size={14} />
                        </button>
                      </>
                    )}
                    {job.status === 'Awaiting Review' && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-xl" style={{ background: '#F3E8FF', color: '#7C3AED', border: '1px solid #E9D5FF' }}>
                        <CheckCircle size={14} />Submitted for Review
                      </div>
                    )}
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                      Details <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bento-tile">
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">All Open Jobs</h3>
                </div>
                <div className="divide-y divide-slate-50 overflow-y-auto" style={{ maxHeight: 300 }}>
                  {openJOs.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">No open job orders.</div>
                  ) : openJOs.slice(0, 10).map((job) => (
                    <div key={job.id} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-medium text-slate-800 truncate">{job.equipmentName}</span>
                        <PriorityBadge priority={job.priority} />
                      </div>
                      <div className="text-xs text-slate-600 truncate">{job.title}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-400">Due {formatDate(job.dueDate)}</span>
                        <StatusBadge status={job.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bento-tile">
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <h3 className="text-sm font-semibold text-slate-800">Safety Notices</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EBF2FF', color: '#5B8DEF' }}>
                      <Wrench size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Hot Work Permit Required</div>
                      <div className="text-xs text-slate-500 mt-0.5">Any welding or grinding requires prior approval. Contact Chief Engineer for Hot Work Permit.</div>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#eef2ff', color: '#FF9F0A' }}>
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">HSEQ Records</div>
                      <div className="text-xs text-slate-500 mt-0.5">Check equipment HSEQ tab for equipment-specific safety notices and risk assessments.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
