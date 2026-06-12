import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ship, Wrench, AlertTriangle } from 'lucide-react';
import { getVesselById } from '../../data/vessels';
import { jobOrders } from '../../data/jobOrders';
import { defects } from '../../data/defects';
import { equipmentTree, flattenEquipment } from '../../data/equipment';
import { StatusBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';

const P = 'https://images.pexels.com/photos';
const Q = '?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop';
const vesselImages: Record<string, string> = {
  'Cruise Ship':     `${P}/33270055/pexels-photo-33270055.jpeg${Q}`,
  'Bulk Carrier':    `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
  'Container Vessel':`${P}/9806482/pexels-photo-9806482.jpeg${Q}`,
  'General Cargo':   `${P}/36638041/pexels-photo-36638041.jpeg${Q}`,
  'Chemical Tanker': `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Tanker':          `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Product Tanker':  `${P}/10832142/pexels-photo-10832142.jpeg${Q}`,
  'LPG Carrier':     `${P}/1036866/pexels-photo-1036866.jpeg${Q}`,
  'OBO Carrier':     `${P}/19500302/pexels-photo-19500302.jpeg${Q}`,
  'Ro-Ro Vessel':    `${P}/37828492/pexels-photo-37828492.jpeg${Q}`,
  'default':         `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
};

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  operational: { bg: '#DCFCE7', border: '#34C759', text: '#15803D' },
  under_maintenance: { bg: '#eef2ff', border: '#FF9F0A', text: '#3730a3' },
  defect: { bg: '#FFE5E4', border: '#FF453A', text: '#CC1100' },
  inactive: { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

const flagEmoji: Record<string, string> = {
  'Panama': '🇵🇦', 'Marshall Islands': '🇲🇭', 'Singapore': '🇸🇬',
  'Bahamas': '🇧🇸', 'Hong Kong': '🇭🇰', 'Greece': '🇬🇷',
  'Liberia': '🇱🇷', 'Cyprus': '🇨🇾',
};

export function VesselDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const vessel = getVesselById(id ?? '');

  if (!vessel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Vessel Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/vessels')}>Back to Vessels</button>
        </div>
      </div>
    );
  }

  const imgSrc = vesselImages[vessel.type] ?? vesselImages['default'];
  const vesselJobs = jobOrders.filter(j => j.vessel === vessel.name);
  const vesselDefects = defects.filter(d => d.vessel === vessel.name);
  const openJobs = vesselJobs.filter(j => j.status !== 'Completed' && j.status !== 'Approved').length;
  const overdueJobs = vesselJobs.filter(j => {
    const due = new Date(j.dueDate);
    return due < new Date('2025-01-11') && j.status !== 'Completed' && j.status !== 'Approved';
  }).length;

  const allEquipment = flattenEquipment(equipmentTree).filter(e => !e.isGroup);

  return (
    <div className="overflow-auto h-full" style={{ background: '#F5F5F7' }}>
      {/* Hero */}
      <div className="relative" style={{ height: '280px' }}>
        <img src={imgSrc} alt={vessel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)' }}></div>

        {/* Back button */}
        <button
          onClick={() => navigate('/vessels')}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={16} />
          Back to Vessels
        </button>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={vessel.status} />
                <span className="text-white/70 text-xs">{vessel.classSociety}</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{vessel.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
                <span>{vessel.type}</span>
                <span>·</span>
                <span>IMO {vessel.imo}</span>
                <span>·</span>
                <span>{flagEmoji[vessel.flag] || ''} {vessel.flag}</span>
                <span>·</span>
                <span>Built {vessel.buildYear}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/60 text-xs mb-0.5">Owner</div>
              <div className="text-white font-semibold text-sm">{vessel.owner}</div>
              <div className="text-white/60 text-xs mt-1">Port</div>
              <div className="text-white font-semibold text-sm">{vessel.port}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* 3 Stat tiles */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#EBF2FF', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#BFDBFE', color: '#5B8DEF' }}>
              <Wrench size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#1D4ED8' }}>{openJobs}</div>
              <div className="text-xs font-medium" style={{ color: '#5B8DEF' }}>Open Job Orders</div>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#FFE5E4', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFCCCB', color: '#FF453A' }}>
              <Ship size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#CC1100' }}>{overdueJobs}</div>
              <div className="text-xs font-medium" style={{ color: '#FF453A' }}>Overdue Jobs</div>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#eef2ff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFE4B0', color: '#FF9F0A' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#3730a3' }}>{vesselDefects.filter(d => d.status !== 'Resolved' && d.status !== 'Closed').length}</div>
              <div className="text-xs font-medium" style={{ color: '#FF9F0A' }}>Active Defects</div>
            </div>
          </div>
        </div>

        {/* Equipment Health Grid */}
        <div className="bento-tile p-5">
          <h3 className="text-base font-bold text-slate-900 mb-1">Equipment Overview</h3>
          <p className="text-xs text-slate-500 mb-4">All equipment health status at a glance</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {allEquipment.slice(0, 32).map(eq => {
              const status = eq.status ?? 'operational';
              const colors = statusColors[status] ?? statusColors.operational;
              return (
                <div
                  key={eq.id}
                  className="rounded-xl p-3 transition-all hover:scale-[1.02]"
                  style={{
                    background: colors.bg,
                    borderLeft: `4px solid ${colors.border}`,
                    boxShadow: `0 4px 0 0 ${colors.border}33, 0 6px 12px rgba(0,0,0,0.08)`,
                    cursor: 'pointer',
                  }}
                >
                  <div className="text-xs font-mono" style={{ color: colors.border, marginBottom: '2px' }}>{eq.code}</div>
                  <div className="text-xs font-semibold text-slate-800 leading-tight truncate" title={eq.name}>{eq.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.border }}></div>
                    <span className="text-xs capitalize" style={{ color: colors.text }}>
                      {status === 'under_maintenance' ? 'Maintenance' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Job Orders */}
        {vesselJobs.length > 0 && (
          <div className="bento-tile">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Recent Job Orders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Job orders for {vessel.name}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Job #</th>
                    <th>Title</th>
                    <th>Equipment</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vesselJobs.slice(0, 8).map((jo) => (
                    <tr key={jo.id}>
                      <td className="text-xs font-mono text-slate-500">{jo.joNumber}</td>
                      <td className="text-xs font-medium text-slate-800">{jo.title}</td>
                      <td className="text-xs text-slate-600">{jo.equipmentName}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">{jo.dueDate}</td>
                      <td><PriorityBadge priority={jo.priority} /></td>
                      <td><StatusBadge status={jo.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Open Defects */}
        {vesselDefects.length > 0 && (
          <div className="bento-tile">
            <div className="px-5 py-4 border-b border-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Open Defects</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active defects for {vessel.name}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Defect ID</th>
                    <th>Equipment</th>
                    <th>Description</th>
                    <th>Reported</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vesselDefects.map((d) => (
                    <tr key={d.id}>
                      <td className="text-xs font-mono text-slate-500">{d.defectId}</td>
                      <td className="text-xs font-medium text-slate-700">{d.equipmentName}</td>
                      <td className="text-xs text-slate-600 max-w-xs truncate" title={d.description}>{d.description}</td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">{d.reportedDate}</td>
                      <td><SeverityBadge severity={d.severity} /></td>
                      <td><StatusBadge status={d.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
