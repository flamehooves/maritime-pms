import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { vessels } from '../../data/vessels';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';

const flagEmoji: Record<string, string> = {
  'Panama': '🇵🇦', 'Marshall Islands': '🇲🇭', 'Singapore': '🇸🇬',
  'Bahamas': '🇧🇸', 'Hong Kong': '🇭🇰', 'Greece': '🇬🇷',
  'Liberia': '🇱🇷', 'Cyprus': '🇨🇾',
};

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

export function VesselsPage() {
  const { currentRole } = useApp();
  const navigate = useNavigate();

  return (
    <div className="p-6 min-h-full" style={{ background: '#F5F5F7' }}>
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
          return (
            <div
              key={v.id}
              className="relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
              onClick={() => navigate(`/vessels/${v.id}`)}
            >
              {/* Image */}
              <div className="relative" style={{ height: '120px' }}>
                <img src={imgSrc} alt={v.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)' }}></div>
                <div className="absolute top-2 right-2">
                  <StatusBadge status={v.status} />
                </div>
              </div>

              {/* Content */}
              <div className="bg-white p-4">
                <h3 className="text-base font-bold text-slate-900 mb-0.5">{v.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{v.type}</p>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs mb-3">
                  <div><span className="text-slate-400">IMO</span> <span className="text-slate-700 font-medium">{v.imo}</span></div>
                  <div><span className="text-slate-400">Flag</span> <span className="text-slate-700">{flagEmoji[v.flag] || ''} {v.flag}</span></div>
                  <div><span className="text-slate-400">Built</span> <span className="text-slate-700 font-medium">{v.buildYear}</span></div>
                  <div><span className="text-slate-400">Class</span> <span className="text-slate-700">{v.classSociety}</span></div>
                  <div><span className="text-slate-400">DWT</span> <span className="text-slate-700 font-medium">{v.dwt.toLocaleString()} t</span></div>
                  <div><span className="text-slate-400">GRT</span> <span className="text-slate-700 font-medium">{v.grt.toLocaleString()}</span></div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="truncate"><span className="font-medium">Owner:</span> {v.owner}</div>
                  <div className="truncate mt-0.5"><span className="font-medium">Manager:</span> {v.manager}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
