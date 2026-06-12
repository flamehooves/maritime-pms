import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Ship, Wrench, AlertCircle, CheckSquare, Anchor } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { PriorityBadge, StatusBadge } from '../../components/ui/StatusBadge';
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

const vesselImages: Record<string, string> = {
  'Bulk Carrier': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
  'Chemical Tanker': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
  'Product Tanker': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80',
  'Container Vessel': 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400&q=80',
  'default': 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400&q=80',
};

function getVesselImage(type: string): string {
  return vesselImages[type] ?? vesselImages['default'];
}

function getHeatmapColor(val: number): string {
  if (val >= 90) return '#34C759';
  if (val >= 75) return '#FF9F0A';
  return '#FF453A';
}

function getVesselStatusDot(vs: string | undefined): { color: string; label: string } {
  switch (vs) {
    case 'at_sea': return { color: '#5B8DEF', label: 'At Sea' };
    case 'in_port': return { color: '#34C759', label: 'In Port' };
    case 'in_maintenance': return { color: '#FF9F0A', label: 'Maintenance' };
    case 'drydock': return { color: '#9CA3AF', label: 'Drydock' };
    default: return { color: '#9CA3AF', label: 'Unknown' };
  }
}

// Fleet Map with simple SVG continents
function FleetMap() {
  const mapVessels = vessels.filter(v => v.mapPosition);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '260px' }}>
      <svg viewBox="0 0 800 400" className="w-full h-full" style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #0D3060 50%, #0A2447 100%)' }}>
        {/* Grid lines */}
        {[0, 100, 200, 300].map(y => (
          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        {[0, 100, 200, 300, 400, 500, 600, 700, 800].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="400" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* North America */}
        <path d="M80,60 L140,50 L175,70 L185,100 L175,130 L155,140 L135,160 L115,175 L95,170 L75,150 L65,120 L70,90 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Central America */}
        <path d="M135,175 L155,170 L160,190 L145,200 L130,195 Z" fill="#1E4A6E" opacity="0.8" />
        {/* South America */}
        <path d="M145,205 L175,200 L195,220 L200,260 L190,300 L175,330 L160,340 L145,310 L140,270 L135,230 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Europe */}
        <path d="M390,50 L440,45 L460,55 L450,75 L430,80 L410,75 L395,70 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Africa */}
        <path d="M400,90 L440,85 L465,100 L475,140 L470,190 L455,230 L435,245 L415,240 L400,210 L395,170 L390,130 L392,100 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Asia */}
        <path d="M465,45 L560,40 L620,50 L660,60 L650,90 L620,100 L580,105 L545,110 L510,105 L490,90 L470,80 L455,65 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Southeast Asia */}
        <path d="M580,110 L620,105 L640,120 L630,140 L610,145 L590,135 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Australia */}
        <path d="M610,220 L660,215 L695,230 L705,265 L695,295 L670,305 L640,300 L615,280 L608,250 Z" fill="#1E4A6E" opacity="0.8" />
        {/* Russia/North Asia */}
        <path d="M460,25 L600,20 L660,30 L655,55 L620,50 L560,40 L465,45 Z" fill="#1E4A6E" opacity="0.8" />

        {/* Vessel dots */}
        {mapVessels.map(v => {
          const x = (v.mapPosition!.x / 100) * 800;
          const y = (v.mapPosition!.y / 100) * 400;
          const { color } = getVesselStatusDot(v.vesselStatus);
          return (
            <g key={v.id}>
              <circle cx={x} cy={y} r="8" fill={color} opacity="0.25" />
              <circle cx={x} cy={y} r="5" fill={color} opacity="0.7" />
              <circle cx={x} cy={y} r="3" fill={color} />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3">
        {[
          { color: '#5B8DEF', label: 'At Sea' },
          { color: '#34C759', label: 'In Port' },
          { color: '#FF9F0A', label: 'Maintenance' },
          { color: '#9CA3AF', label: 'Drydock' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: item.color }}></div>
            <span className="text-white text-xs opacity-70">{item.label}</span>
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
      className="relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-all duration-200"
      style={{ height: '160px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}
      onClick={() => navigate(`/vessels/${vessel.id}`)}
    >
      <img src={imgSrc} alt={vessel.name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.30) 60%, transparent 100%)' }}></div>
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-white font-bold text-sm leading-tight">{vessel.name}</div>
            <div className="text-white/70 text-xs">{vessel.type}</div>
            <div className="text-white/50 text-xs">IMO {vessel.imo}</div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${color}22`, color: color, border: `1px solid ${color}44` }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}></div>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const atSea = vessels.filter(v => v.vesselStatus === 'at_sea').length;
  const inPort = vessels.filter(v => v.vesselStatus === 'in_port').length;
  const inMaint = vessels.filter(v => v.vesselStatus === 'in_maintenance').length;

  return (
    <div className="p-5 space-y-5 min-h-full" style={{ background: '#F5F5F7' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fleet Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management · {vessels.length} vessels · Updated just now</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
          Live · Jan 11, 2025
        </div>
      </div>

      {/* Row 1: Stat tiles */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard size="sm" variant="pastel" label="Total Vessels" value={vessels.length} icon={<Ship size={14} />} color="info" />
        <StatCard size="sm" variant="pastel" label="At Sea" value={atSea} icon={<Anchor size={14} />} color="teal" />
        <StatCard size="sm" variant="pastel" label="In Port" value={inPort} icon={<Ship size={14} />} color="success" />
        <StatCard size="sm" variant="pastel" label="In Maintenance" value={inMaint} icon={<Wrench size={14} />} color="warning" />
        <StatCard size="sm" variant="pastel" label="Critical Defects" value={7} icon={<AlertCircle size={14} />} color="danger" />
      </div>

      {/* Row 2: Fleet Map + Health Score */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fleet Map */}
        <div className="col-span-2 rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: '300px' }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: '#0B1D3A' }}>
            <div>
              <h3 className="text-white font-semibold text-sm">Fleet Map</h3>
              <p className="text-blue-300/60 text-xs">{vessels.length} vessels tracked globally</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-300/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Live tracking
            </div>
          </div>
          <FleetMap />
        </div>

        {/* Health Score */}
        <div className="bento-tile p-4">
          <HealthGauge score={81} />
        </div>
      </div>

      {/* Row 3: Fuel Chart + Heatmap + Crew Readiness */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fuel Chart */}
        <div className="bento-tile p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Fuel Consumption</h3>
          <p className="text-xs text-slate-500 mb-3">Fleet total (MT) · Jan–Jun 2025</p>
          <div style={{ height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fuelData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B8DEF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B8DEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Tooltip
                  formatter={(v) => [`${v} MT`, 'Fuel']}
                  contentStyle={{ fontSize: 11, border: 'none', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                />
                <Area type="monotone" dataKey="fuel" stroke="#5B8DEF" strokeWidth={2} fill="url(#fuelGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Heatmap */}
        <div className="bento-tile p-4">
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
                    style={{
                      width: '24px',
                      height: '20px',
                      flexShrink: 0,
                      background: getHeatmapColor(val),
                      opacity: 0.6 + (val / 100) * 0.4,
                    }}
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
        <div className="bento-tile p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Crew Readiness</h3>
          <p className="text-xs text-slate-500 mb-4">Fleet-wide crew status overview</p>
          <div className="space-y-4">
            {[
              { label: 'Active Crew', value: 248, color: '#34C759', bg: '#DCFCE7' },
              { label: 'Expiring Certs', value: 14, color: '#FF9F0A', bg: '#FFF3DC' },
              { label: 'Crew Changes', value: 7, color: '#5B8DEF', bg: '#EBF2FF' },
              { label: 'Off-signers Due', value: 23, color: '#BF5AF2', bg: '#F3E8FF' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: item.bg }}>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-xl font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Fleet Cards */}
      <div className="bento-tile p-5">
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

      {/* Row 5: Approvals + Upcoming Jobs */}
      <div className="grid grid-cols-2 gap-4">
        {/* Approval Queue */}
        <div className="bento-tile">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare size={15} className="text-slate-400" />
              Approval Queue
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF3DC', color: '#FF9F0A' }}>18</span>
            </h3>
            <button className="text-xs font-medium" style={{ color: '#5B8DEF' }}>View All →</button>
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
                  <button className="flex-1 text-xs py-1 rounded-lg font-medium transition-colors" style={{ background: '#DCFCE7', color: '#15803D' }}>
                    Approve
                  </button>
                  <button className="flex-1 text-xs py-1 rounded-lg font-medium transition-colors" style={{ background: '#F5F5F7', color: '#6B7280' }}>
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="bento-tile">
          <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Wrench size={15} className="text-slate-400" />
              Upcoming Jobs
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#EBF2FF', color: '#5B8DEF' }}>14</span>
            </h3>
            <button className="text-xs font-medium" style={{ color: '#5B8DEF' }}>View All →</button>
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
