import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Ship, Wrench, AlertCircle, CheckSquare, Anchor } from 'lucide-react';
import { PriorityBadge } from '../../components/ui/StatusBadge';
import { vessels } from '../../data/vessels';

const fuelData = [
  { month: 'Jan', fuel: 4200 },
  { month: 'Feb', fuel: 3800 },
  { month: 'Mar', fuel: 4600 },
  { month: 'Apr', fuel: 4100 },
  { month: 'May', fuel: 3900 },
  { month: 'Jun', fuel: 4400 },
];

const vesselHealthScores: Record<string, number> = {
  'MAHAKALI': 76,
  'SEALION SPIRIT': 94,
  'PACIFIC TRADER': 78,
  'NORTHERN STAR': 97,
  'OCEAN PRIDE': 89,
  'ATLAS VOYAGER': 91,
  'MERIDIAN QUEEN': 75,
};

const heatmapData = [
  { vessel: 'MAHAKALI', days: [80, 60, 90, 40, 70, 85, 50] },
  { vessel: 'SEALION SPIRIT', days: [95, 90, 88, 92, 94, 96, 89] },
  { vessel: 'PACIFIC TRADER', days: [60, 70, 50, 65, 55, 75, 60] },
  { vessel: 'NORTHERN STAR', days: [98, 95, 97, 96, 99, 94, 97] },
  { vessel: 'OCEAN PRIDE', days: [85, 88, 82, 90, 87, 83, 91] },
  { vessel: 'ATLAS VOYAGER', days: [92, 88, 94, 86, 90, 93, 88] },
  { vessel: 'MERIDIAN QUEEN', days: [70, 65, 72, 68, 74, 71, 66] },
];
const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const pendingApprovals = [
  { type: 'Job Order', title: 'Fire Pump No.1 – Annual Overhaul', vessel: 'MAHAKALI', requestedBy: 'J. Torres', date: 'Jan 9', priority: 'High' },
  { type: 'Job Order', title: 'Emergency Generator Monthly Test', vessel: 'MAHAKALI', requestedBy: 'R. Gupta', date: 'Jan 9', priority: 'High' },
  { type: 'Job Order', title: 'AIS Annual Inspection', vessel: 'MAHAKALI', requestedBy: 'C. Santos', date: 'Jan 8', priority: 'High' },
  { type: 'Spare Request', title: 'M/E Exhaust Valve Spindle × 6', vessel: 'MAHAKALI', requestedBy: 'C. Engineer', date: 'Jan 7', priority: 'Critical' },
  { type: 'Spare Request', title: 'Fuel Injection Nozzle × 6', vessel: 'SEALION SPIRIT', requestedBy: 'K. Pereira', date: 'Jan 7', priority: 'High' },
];

const upcomingJobs = [
  { vessel: 'MAHAKALI', equipment: 'EMERGENCY GENERATOR', job: 'Monthly Test Run', dueDate: 'Jan 15', priority: 'High', assignedTo: 'Electrician' },
  { vessel: 'MAHAKALI', equipment: 'LIFEBOAT ENGINE NO.2', job: 'Defect Repair', dueDate: 'Jan 12', priority: 'Critical', assignedTo: '3rd Engineer' },
  { vessel: 'SEALION SPIRIT', equipment: 'FIRE PUMP NO.1', job: 'Annual Overhaul', dueDate: 'Jan 14', priority: 'High', assignedTo: '3rd Engineer' },
  { vessel: 'PACIFIC TRADER', equipment: 'MAIN ENGINE', job: 'Top Overhaul – Cyl. 4', dueDate: 'Jan 16', priority: 'Critical', assignedTo: 'Chief Engineer' },
  { vessel: 'NORTHERN STAR', equipment: 'CARGO PUMP NO.1', job: 'Annual Inspection', dueDate: 'Jan 18', priority: 'High', assignedTo: '2nd Engineer' },
];

const P = 'https://images.pexels.com/photos';
const Q = '?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
const vesselTypeImages: Record<string, string> = {
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

function getVesselImage(type: string): string {
  return vesselTypeImages[type] ?? vesselTypeImages['default'];
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

// Fleet Map using PNG world map
function FleetMap() {
  const mapVessels = vessels.filter(v => v.mapPosition);

  return (
    <div className="relative w-full" style={{ minHeight: '320px', background: '#0a1628', position: 'relative', overflow: 'hidden' }}>
      {/* Base map: faint white silhouette */}
      <img
        src="/maritime-pms/world-map.png"
        alt=""
        aria-hidden="true"
        style={{
          filter: 'brightness(0) invert(1) opacity(0.15)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
        }}
      />
      {/* Blue tinted overlay */}
      <img
        src="/maritime-pms/world-map.png"
        alt=""
        aria-hidden="true"
        style={{
          filter: 'invert(1) sepia(1) saturate(2) hue-rotate(180deg) opacity(0.4)',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
        }}
      />
      {/* Vessel dots — CSS-positioned divs for perfect circles */}
      <style>{`
        @keyframes vesselPing {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        .vessel-dot-group:hover .vessel-tooltip { display: block; }
        .vessel-tooltip { display: none; }
      `}</style>
      {mapVessels.map(v => {
        const { color } = getVesselStatusDot(v.vesselStatus);
        const isActive = v.vesselStatus === 'at_sea';
        return (
          <div
            key={v.id}
            className="vessel-dot-group"
            style={{
              position: 'absolute',
              left: `${v.mapPosition!.x}%`,
              top: `${v.mapPosition!.y}%`,
              zIndex: 10,
              cursor: 'pointer',
            }}
          >
            {/* Ping ring */}
            {isActive && (
              <div style={{
                position: 'absolute',
                width: 20, height: 20,
                borderRadius: '50%',
                background: color,
                opacity: 0,
                transform: 'translate(-50%, -50%)',
                animation: 'vesselPing 2s ease-out infinite',
              }} />
            )}
            {/* Dot */}
            <div style={{
              position: 'absolute',
              width: 10, height: 10,
              borderRadius: '50%',
              background: color,
              border: '2px solid rgba(255,255,255,0.8)',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 6px ${color}99`,
            }} />
            {/* Tooltip */}
            <div className="vessel-tooltip" style={{
              position: 'absolute',
              bottom: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(10,22,40,0.95)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              border: `1px solid ${color}66`,
              pointerEvents: 'none',
            }}>
              {v.name}
              <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, fontSize: 10 }}>
                {v.vesselStatus === 'at_sea' ? '⚓ At Sea' : v.vesselStatus === 'in_port' ? '🏁 In Port' : v.vesselStatus === 'in_maintenance' ? '🔧 Maintenance' : '🞊 Drydock'}
              </div>
            </div>
          </div>
        );
      })}
      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 12, alignItems: 'center', zIndex: 10 }}>
        {[
          { color: '#3b82f6', label: 'At Sea' },
          { color: '#22c55e', label: 'In Port' },
          { color: '#f59e0b', label: 'Maintenance' },
          { color: '#94a3b8', label: 'Drydock' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color }}></div>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fleet Health Score gauge
function HealthGauge({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const healthVessels = Object.entries(vesselHealthScores).slice(0, 6);

  return (
    <div className="flex flex-col items-center h-full">
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="12" />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#34C759"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold text-slate-900">{score}</div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>
      <div className="text-sm font-semibold text-slate-700 mb-3">Fleet Health Score</div>
      <div className="w-full space-y-2 px-2">
        {healthVessels.map(([name, s]) => (
          <div key={name} className="flex items-center gap-2">
            <span className="text-xs text-slate-500 truncate" style={{ width: '90px', flexShrink: 0 }}>{name.split(' ')[0]}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${s}%`,
                  background: s >= 90 ? '#34C759' : s >= 80 ? '#FF9F0A' : '#FF453A'
                }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-slate-700" style={{ width: '28px', textAlign: 'right' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VesselCard({ vessel }: { vessel: typeof vessels[0] }) {
  const navigate = useNavigate();
  const imgSrc = getVesselImage(vessel.type);
  const { color, label } = getVesselStatusDot(vessel.vesselStatus);

  return (
    <div
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{ height: '200px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
      onClick={() => navigate(`/vessels/${vessel.id}`)}
    >
      <img src={imgSrc} alt={vessel.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}></div>
      {/* Status badge top-right */}
      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${color}33`, border: `1px solid ${color}66`, fontSize: 11, color, fontWeight: 600 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}></div>
          {label}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{vessel.name}</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{vessel.type}</div>
      </div>
    </div>
  );
}

// Clean stat card (no pastel, white bg)
function StatTile({ label, value, icon, accentColor }: { label: string; value: number | string; icon: React.ReactNode; accentColor: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export function AdminDashboard() {
  const atSea = vessels.filter(v => v.vesselStatus === 'at_sea').length;
  const inPort = vessels.filter(v => v.vesselStatus === 'in_port').length;
  const inMaint = vessels.filter(v => v.vesselStatus === 'in_maintenance').length;

  return (
    <div className="p-5 min-h-full w-full" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management · {vessels.length} vessels · Updated just now</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          Live · Jan 11, 2025
        </div>
      </div>

      {/* Row 1: 5 stat tiles */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <StatTile label="Total Vessels" value={vessels.length} icon={<Ship size={15} />} accentColor="#3b82f6" />
        <StatTile label="At Sea" value={atSea} icon={<Anchor size={15} />} accentColor="#0ea5e9" />
        <StatTile label="In Port" value={inPort} icon={<Ship size={15} />} accentColor="#22c55e" />
        <StatTile label="In Maintenance" value={inMaint} icon={<Wrench size={15} />} accentColor="#f59e0b" />
        <StatTile label="Critical Defects" value={7} icon={<AlertCircle size={15} />} accentColor="#ef4444" />
      </div>

      {/* Row 2: Fleet Map (2/3) + Health Score (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        {/* Fleet Map */}
        <div style={{ gridColumn: 'span 2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', background: '#0a1628' }}>
          <div style={{ padding: '12px 16px', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Fleet Map</div>
              <div style={{ color: 'rgba(147,197,253,0.6)', fontSize: 12 }}>{vessels.length} vessels tracked globally</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(147,197,253,0.6)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
              Live tracking
            </div>
          </div>
          <FleetMap />
        </div>
        {/* Health Score */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20 }}>
          <HealthGauge score={81} />
        </div>
      </div>

      {/* Row 3: Fuel Chart | Maintenance Heatmap | Crew Readiness */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }}>
        {/* Fuel Chart */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Fuel Consumption</h3>
          <p className="text-xs text-slate-500 mb-3">Fleet total (MT) · Jan–Jun 2025</p>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(v) => [`${v} MT`, 'Fuel']}
                  contentStyle={{ fontSize: 11, border: 'none', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                />
                <Area type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={2} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Heatmap */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Maintenance Activity</h3>
          <p className="text-xs text-slate-500 mb-3">Completion rate by vessel × day</p>
          <div className="space-y-1.5">
            <div className="flex gap-1 mb-1">
              <span className="text-xs text-slate-400" style={{ width: '90px', flexShrink: 0 }}></span>
              {weekDays.map((d, i) => (
                <span key={i} className="text-xs text-slate-400 text-center" style={{ width: '24px', flexShrink: 0 }}>{d}</span>
              ))}
            </div>
            {heatmapData.map((row) => (
              <div key={row.vessel} className="flex items-center gap-1">
                <span className="text-xs text-slate-500 truncate" style={{ width: '90px', flexShrink: 0 }}>{row.vessel.split(' ')[0]}</span>
                {row.days.map((val, i) => (
                  <div
                    key={i}
                    title={`${row.vessel} · ${weekDays[i]} · ${val}%`}
                    className="rounded"
                    style={{ width: '24px', height: '20px', flexShrink: 0, background: getHeatmapColor(val), opacity: 0.6 + (val / 100) * 0.4 }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: '#34C759' }}></div><span className="text-xs text-slate-400">≥90%</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: '#FF9F0A' }}></div><span className="text-xs text-slate-400">75–89%</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm" style={{ background: '#FF453A' }}></div><span className="text-xs text-slate-400">&lt;75%</span></div>
          </div>
        </div>

        {/* Crew Readiness */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 18 }}>
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Crew Readiness</h3>
          <p className="text-xs text-slate-500 mb-4">Fleet-wide crew status overview</p>
          <div className="space-y-3">
            {[
              { label: 'Active Crew', value: 248, color: '#16a34a' },
              { label: 'Expiring Certs', value: 14, color: '#d97706' },
              { label: 'Crew Changes', value: 7, color: '#3b82f6' },
              { label: 'Off-signers Due', value: 23, color: '#7c3aed' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{item.label}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Fleet Cards */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: 20, marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Fleet Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click a vessel to view full details</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {vessels.map(v => <VesselCard key={v.id} vessel={v} />)}
        </div>
      </div>

      {/* Row 5: Approvals (2/3) + Upcoming Jobs (1/3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {/* Approval Queue */}
        <div style={{ gridColumn: 'span 2', background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare size={15} className="text-slate-400" />
              Approval Queue
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF3DC', color: '#FF9F0A' }}>18</span>
            </h3>
            <button className="text-xs font-medium" style={{ color: '#3b82f6' }}>View All →</button>
          </div>
          <div className="divide-y divide-slate-50">
            {pendingApprovals.map((item, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-xs font-medium text-slate-800 leading-tight">{item.title}</div>
                  <PriorityBadge priority={item.priority} />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span className="px-1.5 py-0.5 rounded-md text-xs" style={{ background: '#F5F5F7', color: '#6B7280' }}>{item.type}</span>
                  <span>{item.vessel}</span>
                  <span>·</span>
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="flex-1 text-xs py-1 rounded-lg font-medium" style={{ background: '#DCFCE7', color: '#15803D' }}>Approve</button>
                  <button className="flex-1 text-xs py-1 rounded-lg font-medium" style={{ background: '#F5F5F7', color: '#6B7280' }}>Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Wrench size={15} className="text-slate-400" />
              Upcoming Jobs
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EBF2FF', color: '#3b82f6' }}>14</span>
            </h3>
            <button className="text-xs font-medium" style={{ color: '#3b82f6' }}>View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Vessel</th>
                  <th>Equipment</th>
                  <th>Due</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {upcomingJobs.map((job, i) => (
                  <tr key={i} className="cursor-pointer">
                    <td className="text-xs font-semibold text-slate-700">{job.vessel}</td>
                    <td className="text-xs text-slate-600">{job.equipment}</td>
                    <td className="text-xs text-slate-600 whitespace-nowrap">{job.dueDate}</td>
                    <td><PriorityBadge priority={job.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
