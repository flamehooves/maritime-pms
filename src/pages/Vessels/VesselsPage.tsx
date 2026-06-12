import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { vessels } from '../../data/vessels';
import { useApp } from '../../context/AppContext';

const vesselTypeImages: Record<string, string> = {
  'Bulk Carrier': 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&q=80',
  'Container Vessel': 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=600&q=80',
  'General Cargo': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
  'Chemical Tanker': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80',
  'Tanker': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80',
  'Product Tanker': 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80',
  'LPG Carrier': 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=600&q=80',
  'OBO Carrier': 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&q=80',
  'default': 'https://images.unsplash.com/photo-1548032885-b5e38734688a?w=600&q=80',
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
