import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Ship, Wrench, AlertCircle, CheckSquare, Anchor, Loader } from 'lucide-react';
import { PriorityBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchVessels, fetchJobOrdersForApproval, fetchJobOrders, fetchDefects, approveJobOrder } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import type { Vessel } from '../../types';
// NOTE: all dashboard data sourced from Zoho CRM

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const P = 'https://images.pexels.com/photos';
const Q = '?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
const vesselTypeImages: Record<string, string> = {
  'Cruise Ship':      `${P}/33270055/pexels-photo-33270055.jpeg${Q}`,
  'Bulk Carrier':     `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
  'Container Vessel': `${P}/9806482/pexels-photo-9806482.jpeg${Q}`,
  'General Cargo':    `${P}/36638041/pexels-photo-36638041.jpeg${Q}`,
  'Chemical Tanker':  `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Tanker':           `${P}/36563588/pexels-photo-36563588.jpeg${Q}`,
  'Product Tanker':   `${P}/10832142/pexels-photo-10832142.jpeg${Q}`,
  'LPG Carrier':      `${P}/1036866/pexels-photo-1036866.jpeg${Q}`,
  'OBO Carrier':      `${P}/19500302/pexels-photo-19500302.jpeg${Q}`,
  'Ro-Ro Vessel':     `${P}/37828492/pexels-photo-37828492.jpeg${Q}`,
  'default':          `${P}/11940863/pexels-photo-11940863.jpeg${Q}`,
};

function getVesselImage(type: string, imageUrl?: string): string {
  return imageUrl || vesselTypeImages[type] || vesselTypeImages['default'];
}

function getHeatmapColor(val: number): string {
  if (val >= 90) return '#34C759';
  if (val >= 75) return '#FF9F0A';
  return '#FF453A';
}

function getVesselStatusDot(vs: string | undefined): { color: string; label: string } {
  switch (vs) {
    case 'at_sea': return { color: '#3b82f6', label: 'At Sea' };
    case 'in_port': return { color: '#22c55e', label: 'In Port' };
    case 'in_maintenance': return { color: '#f59e0b', label: 'Maintenance' };
    case 'drydock': return { color: '#94a3b8', label: 'Drydock' };
    default: return { color: '#94a3b8', label: 'Unknown' };
  }
}

// Fleet Map — uses CRM vessel position data overlaid on world map
function FleetMap({ vessels }: { vessels: (Vessel & { mapPosition?: { x: number; y: number } })[] }) {
  const mapVessels = vessels.filter(v => v.mapPosition);
  return (
    <div className="relative w-full" style={{ height: '320px', background: '#EEF6FC', overflow: 'hidden', borderRadius: 12 }}>
      <img src="/maritime-pms/world-map.png" alt="" aria-hidden="true"
        style={{ filter: 'brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(165deg) brightness(0.95)', width: '100%', height: '100%', objectFit: 'fill', position: 'absolute', inset: 0, opacity: 0.85 }} />
      <style>{`
        @keyframes vesselPing { 0% { transform: translate(-50%,-50%) scale(1); opacity:.6; } 100% { transform: translate(-50%,-50%) scale(3); opacity:0; } }
        .vessel-dot-group:hover .vessel-tooltip { display: block; }
        .vessel-tooltip { display: none; }
      `}</style>
      {mapVessels.map(v => {
        const { color } = getVesselStatusDot(v.vesselStatus);
        const isActive = v.vesselStatus === 'at_sea';
        return (
          <div key={v.id} className="vessel-dot-group" style={{ position: 'absolute', left: `${v.mapPosition!.x}%`, top: `${v.mapPosition!.y}%`, zIndex: 10, cursor: 'pointer' }}>
            {isActive && <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: color, opacity: 0, transform: 'translate(-50%,-50%)', animation: 'vesselPing 2s ease-out infinite' }} />}
            <div style={{ position: 'absolute', width: 11, height: 11, borderRadius: '50%', background: color, border: '2px solid rgba(255,255,255,0.95)', transform: 'translate(-50%,-50%)', boxShadow: `0 0 8px ${color}cc, 0 1px 3px rgba(0,0,0,0.2)` }} />
            <div className="vessel-tooltip" style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', color: '#1C1C1E', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap', border: `1px solid rgba(255,255,255,0.8)`, boxShadow: `0 4px 12px rgba(0,0,0,0.12), 0 0 0 1px ${color}40`, pointerEvents: 'none' }}>
              {v.name}
              <div style={{ color: '#6B7280', fontWeight: 400, fontSize: 10 }}>{v.vesselStatus === 'at_sea' ? '⚓ At Sea' : v.vesselStatus === 'in_port' ? '🏁 In Port' : v.vesselStatus === 'in_maintenance' ? '🔧 Maintenance' : '🞊 Drydock'}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 10px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        {[{ color: '#3b82f6', label: 'At Sea' }, { color: '#22c55e', label: 'In Port' }, { color: '#f59e0b', label: 'Maintenance' }, { color: '#94a3b8', label: 'Drydock' }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, boxShadow: `0 0 4px ${item.color}` }} />
            <span style={{ color: '#374151', fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function vesselHealthScore(vesselName: string, allDefects: import('../../types').Defect[]): number {
  const vesselDefects = allDefects.filter(d => d.vessel === vesselName && d.status !== 'Closed' && d.status !== 'Resolved');
  const critical = vesselDefects.filter(d => d.severity === 'Critical').length;
  const high = vesselDefects.filter(d => d.severity === 'High').length;
  const score = Math.max(0, 100 - critical * 15 - high * 8 - (vesselDefects.length - critical - high) * 3);
  return Math.min(100, score);
}

function HealthGauge({ vessels, allDefects }: { vessels: Vessel[]; allDefects: import('../../types').Defect[] }) {
  const scores = vessels.slice(0, 6).map(v => ({ name: v.name, score: vesselHealthScore(v.name, allDefects) }));
  const avg = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v.score, 0) / scores.length) : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (avg / 100) * circumference;
  const gaugeColor = avg >= 90 ? '#34C759' : avg >= 75 ? '#FF9F0A' : '#FF453A';
  return (
    <div className="flex flex-col items-center h-full">
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle cx="80" cy="80" r={radius} fill="none" stroke={gaugeColor} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold text-slate-900">{avg}</div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>
      <div className="text-sm font-semibold text-slate-700 mb-3">Fleet Health Score</div>
      <div className="w-full space-y-2 px-2">
        {scores.map(({ name, score: s }) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 truncate" style={{ width: '90px', flexShrink: 0 }}>{name.split(' ')[0]}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s}%`, background: s >= 90 ? '#34C759' : s >= 75 ? '#FF9F0A' : '#FF453A' }} />
            </div>
            <span className="text-xs font-semibold text-slate-700" style={{ width: '28px', textAlign: 'right' }}>{s}</span>
          </div>
        ))}
        {scores.length === 0 && <div className="text-xs text-slate-400 text-center">No vessel data</div>}
      </div>
    </div>
  );
}

const glass: React.CSSProperties = { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)' };

function StatTile({ label, value, icon, accentColor, onClick, loading }: { label: string; value: number | string; icon: React.ReactNode; accentColor: string; onClick?: () => void; loading?: boolean }) {
  return (
    <div onClick={onClick} style={{ ...glass, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, cursor: onClick ? 'pointer' : 'default' }}
      className={onClick ? 'hover:scale-[1.02] transition-transform' : ''}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
        {loading ? <Loader size={20} className="animate-spin text-slate-300" /> : value}
      </div>
    </div>
  );
}

function VesselCard({ vessel }: { vessel: Vessel & { imageUrl?: string } }) {
  const navigate = useNavigate();
  const imgSrc = getVesselImage(vessel.type, vessel.imageUrl);
  const { color, label } = getVesselStatusDot(vessel.vesselStatus);
  return (
    <div className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{ height: '200px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
      onClick={() => navigate(`/vessels/${vessel.id}`)}>
      <img src={imgSrc} alt={vessel.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${color}33`, border: `1px solid ${color}66`, fontSize: 11, color, fontWeight: 600 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />{label}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{vessel.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{vessel.type}</div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { currentVesselId } = useApp();

  const { data: vessels, loading: loadingVessels } = useCrmFetch(fetchVessels);
  const { data: approvals, loading: loadingApprovals, reload: reloadApprovals } = useCrmFetch(fetchJobOrdersForApproval);
  const { data: allJobOrders, loading: loadingJobs } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);
  const { data: allDefects, loading: loadingDefects } = useCrmFetch(() => fetchDefects(currentVesselId), [currentVesselId]);

  // Computed stats from real data
  const atSea = vessels.filter(v => v.vesselStatus === 'at_sea').length;
  const inPort = vessels.filter(v => v.vesselStatus === 'in_port').length;
  const inMaint = vessels.filter(v => v.vesselStatus === 'in_maintenance').length;
  const criticalDefects = allDefects.filter(d => d.severity === 'Critical' && d.status !== 'Closed').length;

  // Upcoming jobs: not completed, sorted by due date, top 5
  const upcomingJobs = [...allJobOrders]
    .filter(j => j.status !== 'Completed' && j.status !== 'Approved' && j.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Jobs completed per month (last 6 months) — from CRM
  const jobsByMonth = (() => {
    const months: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-GB', { month: 'short' });
      const count = allJobOrders.filter(jo => {
        if (jo.status !== 'Completed' && jo.status !== 'Approved') return false;
        const cd = jo.completionDate ? new Date(jo.completionDate) : null;
        return cd && cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, count });
    }
    return months;
  })();

  // Heatmap: jobs completed per vessel per day for last 7 days
  const maintenanceHeatmap = (() => {
    const now = new Date();
    const vesselNames = [...new Set(allJobOrders.map(jo => jo.vessel).filter(Boolean))].slice(0, 6);
    return vesselNames.map(vessel => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(now);
        day.setDate(now.getDate() - (6 - i));
        return allJobOrders.filter(jo => {
          if ((jo.status !== 'Completed' && jo.status !== 'Approved') || jo.vessel !== vessel) return false;
          const cd = jo.completionDate ? new Date(jo.completionDate) : null;
          return cd && cd.toDateString() === day.toDateString();
        }).length;
      });
      return { vessel, days };
    });
  })();

  // Open defects grouped by vessel
  const defectsByVessel = (() => {
    const openDefs = allDefects.filter(d => d.status !== 'Closed' && d.status !== 'Resolved');
    const byVessel: Record<string, { total: number; critical: number; high: number }> = {};
    for (const d of openDefs) {
      const v = d.vessel || 'Unknown';
      if (!byVessel[v]) byVessel[v] = { total: 0, critical: 0, high: 0 };
      byVessel[v].total++;
      if (d.severity === 'Critical') byVessel[v].critical++;
      if (d.severity === 'High') byVessel[v].high++;
    }
    return Object.entries(byVessel).map(([vessel, counts]) => ({ vessel, ...counts }))
      .sort((a, b) => b.critical - a.critical || b.total - a.total);
  })();

  async function handleApprove(id: string) {
    await approveJobOrder(id);
    reloadApprovals();
  }

  return (
    <div className="p-5 min-h-full w-full" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loadingVessels ? 'Loading…' : `${vessels.length} vessels managed`} · Updated just now
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Live · Zoho CRM
        </div>
      </div>

      {/* Row 1: 5 stat tiles */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <StatTile label="Total Vessels" value={vessels.length} icon={<Ship size={15} />} accentColor="#3b82f6" loading={loadingVessels} onClick={() => navigate('/vessels')} />
        <StatTile label="At Sea" value={atSea} icon={<Anchor size={15} />} accentColor="#0ea5e9" loading={loadingVessels} onClick={() => navigate('/vessels')} />
        <StatTile label="In Port" value={inPort} icon={<Ship size={15} />} accentColor="#22c55e" loading={loadingVessels} onClick={() => navigate('/vessels')} />
        <StatTile label="In Maintenance" value={inMaint} icon={<Wrench size={15} />} accentColor="#f59e0b" loading={loadingVessels} onClick={() => navigate('/vessels')} />
        <StatTile label="Critical Defects" value={criticalDefects} icon={<AlertCircle size={15} />} accentColor="#ef4444" loading={loadingDefects} onClick={() => navigate('/defects')} />
      </div>

      {/* Row 2: Fleet Map + Health Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        <div style={{ gridColumn: 'span 2', ...glass, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div>
              <div style={{ color: '#1C1C1E', fontWeight: 600, fontSize: 14 }}>Fleet Map</div>
              <div style={{ color: '#94A3B8', fontSize: 12 }}>{vessels.length} vessels tracked globally</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#22c55e', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live tracking
            </div>
          </div>
          <FleetMap vessels={vessels} />
        </div>
        <div style={{ ...glass, padding: 20 }}>
          <HealthGauge vessels={vessels} allDefects={allDefects} />
        </div>
      </div>

      {/* Row 3: Jobs Completed Chart | Maintenance Heatmap | Defects by Vessel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        <div style={{ ...glass, padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Jobs Completed</h3>
          <p className="text-xs text-slate-500 mb-3">Last 6 months · fleet-wide</p>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobsByMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip formatter={(v) => [`${v}`, 'Completed']} contentStyle={{ fontSize: 11, border: 'none', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
                <Area type="monotone" dataKey="count" stroke="#4f46e6" strokeWidth={2} fill="url(#jobsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...glass, padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Maintenance Heatmap</h3>
          <p className="text-xs text-slate-500 mb-3">Jobs completed per vessel · last 7 days</p>
          {maintenanceHeatmap.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-xs text-slate-400">No completion data yet.</div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex gap-1 mb-1">
                <span className="text-xs text-slate-400" style={{ width: '80px', flexShrink: 0 }} />
                {weekDays.map((d, i) => <span key={i} className="text-xs text-slate-400 text-center" style={{ width: '24px', flexShrink: 0 }}>{d}</span>)}
              </div>
              {maintenanceHeatmap.map(row => (
                <div key={row.vessel} className="flex items-center gap-1">
                  <span className="text-xs text-slate-500 truncate" style={{ width: '80px', flexShrink: 0 }}>{row.vessel.split(' ')[0]}</span>
                  {row.days.map((val, i) => {
                    const color = val > 3 ? '#34C759' : val > 0 ? '#FF9F0A' : '#E5E7EB';
                    return <div key={i} title={`${row.vessel} · ${val} jobs`} className="rounded" style={{ width: '24px', height: '20px', flexShrink: 0, background: color, opacity: val > 0 ? 1 : 0.4 }} />;
                  })}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            {[['#34C759', '>3 jobs'], ['#FF9F0A', '1–3'], ['#E5E7EB', 'None']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                <span className="text-xs text-slate-400">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...glass, padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Open Defects by Vessel</h3>
          <p className="text-xs text-slate-500 mb-4">Count of unresolved defects per vessel</p>
          <div className="space-y-3">
            {defectsByVessel.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">No open defects. 🎉</div>
            ) : defectsByVessel.map(item => (
              <div key={item.vessel} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#334155', width: 90, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.vessel.split(' ')[0]}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 99, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: item.critical > 0 ? '#FF453A' : item.high > 0 ? '#FF9F0A' : '#94A3B8', width: `${Math.min(100, (item.total / Math.max(...defectsByVessel.map(d => d.total))) * 100)}%` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: item.critical > 0 ? '#DC2626' : '#374151', width: 20, textAlign: 'right', flexShrink: 0 }}>{item.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Fleet Cards — real CRM data */}
      <div style={{ ...glass, padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Fleet Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click a vessel to view full details</p>
          </div>
          <button onClick={() => navigate('/vessels')} className="text-xs font-medium" style={{ color: '#3b82f6' }}>View All →</button>
        </div>
        {loadingVessels ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
            <Loader size={16} className="animate-spin" /> Loading vessels…
          </div>
        ) : vessels.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No vessels in CRM yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {vessels.map(v => <VesselCard key={v.id} vessel={v} />)}
          </div>
        )}
      </div>

      {/* Row 5: Approval Queue (2/3) + Upcoming Jobs (1/3) — real CRM data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {/* Approval Queue */}
        <div style={{ gridColumn: 'span 2', ...glass, overflow: 'hidden' }}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare size={15} className="text-slate-400" />
              Approval Queue
              {!loadingApprovals && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#eef2ff', color: '#FF9F0A' }}>
                  {approvals.length}
                </span>
              )}
            </h3>
            <button onClick={() => navigate('/approvals')} className="text-xs font-medium" style={{ color: '#3b82f6' }}>View All →</button>
          </div>
          {loadingApprovals ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm p-6 justify-center">
              <Loader size={16} className="animate-spin" /> Loading…
            </div>
          ) : approvals.length === 0 ? (
            <p className="text-sm text-slate-400 p-6 text-center">No pending approvals.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {approvals.slice(0, 5).map(item => (
                <div key={item.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-xs font-medium text-slate-800 leading-tight">{item.title}</div>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="px-1.5 py-0.5 rounded-md text-xs" style={{ background: '#F5F5F7', color: '#6B7280' }}>Job Order</span>
                    <span>{item.vessel || '—'}</span>
                    {item.dueDate && <><span>·</span><span>{item.dueDate}</span></>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleApprove(item.id)} className="flex-1 text-xs py-1 rounded-lg font-medium" style={{ background: '#DCFCE7', color: '#15803D' }}>Approve</button>
                    <button onClick={() => navigate('/approvals')} className="flex-1 text-xs py-1 rounded-lg font-medium" style={{ background: '#F5F5F7', color: '#6B7280' }}>Review</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Jobs */}
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Wrench size={15} className="text-slate-400" />
              Upcoming Jobs
              {!loadingJobs && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EBF2FF', color: '#3b82f6' }}>
                  {allJobOrders.filter(j => j.status !== 'Completed' && j.status !== 'Approved').length}
                </span>
              )}
            </h3>
            <button onClick={() => navigate('/job-orders')} className="text-xs font-medium" style={{ color: '#3b82f6' }}>View All →</button>
          </div>
          {loadingJobs ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm p-6 justify-center">
              <Loader size={16} className="animate-spin" /> Loading…
            </div>
          ) : upcomingJobs.length === 0 ? (
            <p className="text-sm text-slate-400 p-6 text-center">No upcoming jobs.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr><th>Vessel</th><th>Job</th><th>Due</th><th>Priority</th></tr>
                </thead>
                <tbody>
                  {upcomingJobs.map(job => (
                    <tr key={job.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate('/job-orders')}>
                      <td className="text-xs font-semibold text-slate-700">{job.vessel || '—'}</td>
                      <td className="text-xs text-slate-600 max-w-[120px] truncate">{job.title}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">{job.dueDate}</td>
                      <td><PriorityBadge priority={job.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
