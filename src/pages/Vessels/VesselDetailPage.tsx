import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ship, Wrench, AlertTriangle, Loader, Camera, X, Check } from 'lucide-react';
import { StatusBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchVesselById, fetchJobOrders, fetchDefects, fetchEquipments,
  updateVesselImageUrl,
} from '../../services/crmService';
import type { Vessel } from '../../types';

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
  operational:       { bg: '#DCFCE7', border: '#34C759', text: '#15803D' },
  under_maintenance: { bg: '#eef2ff', border: '#FF9F0A', text: '#3730a3' },
  defect:            { bg: '#FFE5E4', border: '#FF453A', text: '#CC1100' },
  inactive:          { bg: '#F3F4F6', border: '#9CA3AF', text: '#6B7280' },
};

const flagEmoji: Record<string, string> = {
  Panama: '🇵🇦', 'Marshall Islands': '🇲🇭', Singapore: '🇸🇬',
  Bahamas: '🇧🇸', 'Hong Kong': '🇭🇰', Greece: '🇬🇷',
  Liberia: '🇱🇷', Cyprus: '🇨🇾',
};

function ImageEditOverlay({ vessel, onSaved }: { vessel: Vessel & { imageUrl?: string }; onSaved: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(vessel.imageUrl ?? '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    setSaving(true);
    try {
      await updateVesselImageUrl(vessel.id, url);
      onSaved(url);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-xs font-medium transition-all"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
      >
        <Camera size={14} />
        {vessel.imageUrl ? 'Change Image' : 'Add Image URL'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2" style={{ maxWidth: 420 }}>
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="https://example.com/vessel-photo.jpg"
        className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setOpen(false); }}
      />
      <button
        onClick={save}
        disabled={saving}
        className="p-1.5 rounded-xl transition-all"
        style={{ background: 'rgba(79,70,230,0.8)', color: '#fff' }}
      >
        {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button onClick={() => setOpen(false)} className="p-1.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function VesselDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vessel, setVessel] = useState<(Vessel & { imageUrl?: string }) | null | undefined>(undefined);

  useEffect(() => {
    if (!id) { setVessel(null); return; }
    fetchVesselById(id).then(setVessel);
  }, [id]);

  const { data: jobOrders, loading: loadingJobs } = useCrmFetch(
    () => fetchJobOrders(id),
    [id]
  );
  const { data: defects, loading: loadingDefects } = useCrmFetch(
    () => fetchDefects(id),
    [id]
  );
  const { data: equipments, loading: loadingEq } = useCrmFetch(
    () => fetchEquipments(id),
    [id]
  );

  if (vessel === undefined) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-slate-400">
        <Loader size={20} className="animate-spin" /> Loading vessel…
      </div>
    );
  }

  if (vessel === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Vessel Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/vessels')}>Back to Vessels</button>
        </div>
      </div>
    );
  }

  const imgSrc = vessel.imageUrl || vesselImages[vessel.type] || vesselImages['default'];
  const openJobs = jobOrders.filter(j => j.status !== 'Completed' && j.status !== 'Approved').length;
  const overdueJobs = jobOrders.filter(j => j.dueDate && new Date(j.dueDate) < new Date() && j.status !== 'Completed' && j.status !== 'Approved').length;
  const activeDefects = defects.filter(d => d.status !== 'Resolved' && d.status !== 'Closed').length;

  return (
    <div className="overflow-auto h-full" style={{ background: '#F5F5F7' }}>
      {/* Hero */}
      <div className="relative" style={{ height: 280 }}>
        <img src={imgSrc} alt={vessel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)' }} />

        <button
          onClick={() => navigate('/vessels')}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={16} /> Back to Vessels
        </button>

        {/* Image edit button — top right */}
        <div className="absolute top-4 right-4">
          <ImageEditOverlay vessel={vessel} onSaved={url => setVessel(v => v ? { ...v, imageUrl: url } : v)} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/70 text-xs">{vessel.classSociety}</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{vessel.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-white/70 text-sm">
                <span>{vessel.type}</span>
                {vessel.imo && <><span>·</span><span>IMO {vessel.imo}</span></>}
                {vessel.flag && <><span>·</span><span>{flagEmoji[vessel.flag] || ''} {vessel.flag}</span></>}
                {vessel.buildYear ? <><span>·</span><span>Built {vessel.buildYear}</span></> : null}
              </div>
            </div>
            <div className="text-right">
              {vessel.grt > 0 && <><div className="text-white/60 text-xs mb-0.5">GRT</div><div className="text-white font-semibold text-sm">{vessel.grt.toLocaleString()}</div></>}
              <div className="text-white/60 text-xs mt-1">Port</div>
              <div className="text-white font-semibold text-sm">{vessel.port || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Wrench, label: 'Open Job Orders', value: openJobs, bg: '#EBF2FF', iconBg: '#BFDBFE', iconColor: '#5B8DEF', valColor: '#1D4ED8' },
            { icon: Ship, label: 'Overdue Jobs', value: overdueJobs, bg: '#FFE5E4', iconBg: '#FFCCCB', iconColor: '#FF453A', valColor: '#CC1100' },
            { icon: AlertTriangle, label: 'Active Defects', value: activeDefects, bg: '#eef2ff', iconBg: '#FFE4B0', iconColor: '#FF9F0A', valColor: '#3730a3' },
          ].map(({ icon: Icon, label, value, bg, iconBg, iconColor, valColor }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: bg, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                <Icon size={18} style={{ color: iconColor }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: valColor }}>{value}</div>
                <div className="text-xs font-medium" style={{ color: iconColor }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Equipment grid */}
        <div className="bento-tile p-5">
          <h3 className="text-base font-bold text-slate-900 mb-1">Equipment Overview</h3>
          <p className="text-xs text-slate-500 mb-4">
            {loadingEq ? 'Loading…' : `${equipments.length} equipment items`}
          </p>
          {loadingEq ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-4"><Loader size={16} className="animate-spin" /> Loading…</div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {equipments.map(eq => {
                const status = eq.status ?? 'operational';
                const colors = statusColors[status] ?? statusColors.operational;
                return (
                  <div key={eq.id} className="rounded-xl p-3 transition-all hover:scale-[1.02]"
                    style={{ background: colors.bg, borderLeft: `4px solid ${colors.border}`, boxShadow: `0 4px 0 0 ${colors.border}33, 0 6px 12px rgba(0,0,0,0.08)`, cursor: 'pointer' }}>
                    <div className="text-xs font-mono mb-0.5" style={{ color: colors.border }}>{eq.code}</div>
                    <div className="text-xs font-semibold text-slate-800 leading-tight truncate" title={eq.name}>{eq.name}</div>
                    <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{eq.system}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors.border }} />
                      <span className="text-xs capitalize" style={{ color: colors.text }}>
                        {status === 'under_maintenance' ? 'Maintenance' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {equipments.length === 0 && (
                <p className="text-sm text-slate-400 col-span-full py-4">No equipment records found in CRM.</p>
              )}
            </div>
          )}
        </div>

        {/* Job Orders */}
        <div className="bento-tile">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Job Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">{loadingJobs ? 'Loading…' : `${jobOrders.length} orders for ${vessel.name}`}</p>
          </div>
          {loadingJobs ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm p-6"><Loader size={16} className="animate-spin" /> Loading…</div>
          ) : jobOrders.length === 0 ? (
            <p className="text-sm text-slate-400 p-6">No job orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr><th>JO #</th><th>Title</th><th>Equipment</th><th>Due Date</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {jobOrders.slice(0, 10).map(jo => (
                    <tr key={jo.id}>
                      <td className="text-xs font-mono text-slate-500">{jo.joNumber}</td>
                      <td className="text-xs font-medium text-slate-800">{jo.title}</td>
                      <td className="text-xs text-slate-600">{jo.equipmentName || '—'}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">{jo.dueDate || '—'}</td>
                      <td><PriorityBadge priority={jo.priority} /></td>
                      <td><StatusBadge status={jo.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Defects */}
        <div className="bento-tile">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Defects</h3>
            <p className="text-xs text-slate-500 mt-0.5">{loadingDefects ? 'Loading…' : `${defects.length} defects for ${vessel.name}`}</p>
          </div>
          {loadingDefects ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm p-6"><Loader size={16} className="animate-spin" /> Loading…</div>
          ) : defects.length === 0 ? (
            <p className="text-sm text-slate-400 p-6">No defects found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr><th>Defect ID</th><th>Equipment</th><th>Description</th><th>Reported</th><th>Severity</th><th>Status</th></tr></thead>
                <tbody>
                  {defects.map(d => (
                    <tr key={d.id}>
                      <td className="text-xs font-mono text-slate-500">{d.defectId}</td>
                      <td className="text-xs font-medium text-slate-700">{d.equipmentName || '—'}</td>
                      <td className="text-xs text-slate-600 max-w-xs truncate" title={d.description}>{d.description}</td>
                      <td className="text-xs text-slate-500 whitespace-nowrap">{d.reportedDate || '—'}</td>
                      <td><SeverityBadge severity={d.severity} /></td>
                      <td><StatusBadge status={d.status} /></td>
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
