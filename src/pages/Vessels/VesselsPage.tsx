import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { vessels } from '../../data/vessels';
import { useApp } from '../../context/AppContext';

const P = 'https://images.pexels.com/photos';
const Q = '?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';
const vesselTypeImages: Record<string, string> = {
  'Cruise Ship':     `${P}/33270055/pexels-photo-33270055.jpeg${Q}`,
  'Bulk Carrier':    `${P}/12204300/pexels-photo-12204300.jpeg${Q}`,
  'Container Vessel':`${P}/20821680/pexels-photo-20821680.jpeg${Q}`,
  'General Cargo':   `${P}/30463262/pexels-photo-30463262.jpeg${Q}`,
  'Chemical Tanker': `${P}/27275198/pexels-photo-27275198.jpeg${Q}`,
  'Tanker':          `${P}/27275198/pexels-photo-27275198.jpeg${Q}`,
  'Product Tanker':  `${P}/27275198/pexels-photo-27275198.jpeg${Q}`,
  'LPG Carrier':     `${P}/1036866/pexels-photo-1036866.jpeg${Q}`,
  'OBO Carrier':     `${P}/7572149/pexels-photo-7572149.jpeg${Q}`,
  'Ro-Ro Vessel':    `${P}/262353/pexels-photo-262353.jpeg${Q}`,
  'default':         `${P}/12204300/pexels-photo-12204300.jpeg${Q}`,
};

function getVesselImage(type: string): string {
  return vesselTypeImages[type] ?? vesselTypeImages['default'];
}

function getVesselStatusColor(vs: string | undefined): { color: string; label: string } {
  switch (vs) {
    case 'at_sea': return { color: '#3b82f6', label: 'At Sea' };
    case 'in_port': return { color: '#22c55e', label: 'In Port' };
    case 'in_maintenance': return { color: '#f59e0b', label: 'Maintenance' };
    case 'drydock': return { color: '#94a3b8', label: 'Drydock' };
    default: return { color: '#94a3b8', label: 'Unknown' };
  }
}

export function VesselsPage() {
  const { currentRole } = useApp();
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-full w-full" style={{ background: '#f8fafc' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vessel Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management · {vessels.length} vessels managed</p>
        </div>
        {currentRole === 'admin' && (
          <button className="btn-primary"><Plus size={16} />Add Vessel</button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {vessels.map(v => {
          const imgSrc = getVesselImage(v.type);
          const { color, label } = getVesselStatusColor(v.vesselStatus);
          return (
            <div
              key={v.id}
              className="relative overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
              style={{ borderRadius: 16, height: 200, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(`/vessels/${v.id}`)}
            >
              <img
                src={imgSrc}
                alt={v.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }}></div>
              {/* Status badge top-right */}
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 99, background: `${color}33`, border: `1px solid ${color}66`, fontSize: 11, color, fontWeight: 600 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }}></div>
                  {label}
                </div>
              </div>
              {/* Text bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 14px' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{v.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>{v.type}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 1 }}>IMO {v.imo} · {v.flag}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
