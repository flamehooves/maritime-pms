import React from 'react';
import { Plus } from 'lucide-react';
import { vessels } from '../../data/vessels';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';

const flagEmoji: Record<string, string> = {
  'Panama': '🇵🇦', 'Marshall Islands': '🇲🇭', 'Singapore': '🇸🇬',
  'Bahamas': '🇧🇸', 'Hong Kong': '🇭🇰', 'Greece': '🇬🇷',
  'Liberia': '🇱🇷', 'Cyprus': '🇨🇾',
};

const vesselTypeIcon: Record<string, string> = {
  'Bulk Carrier': '🚢', 'Container Vessel': '📦', 'General Cargo': '⚓',
  'Chemical Tanker': '⚗️', 'LPG Carrier': '🔥', 'Tanker': '🛢️',
  'OBO Carrier': '🚢', 'Ro-Ro Vessel': '🚗', 'Product Tanker': '🛢️',
};

export function VesselsPage() {
  const { currentRole } = useApp();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Vessel Register</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management · {vessels.length} vessels managed</p>
        </div>
        {currentRole === 'admin' && (
          <button className="btn-primary"><Plus size={16} />Add Vessel</button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {vessels.map(v => (
          <div
            key={v.id}
            className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{vesselTypeIcon[v.type] || '🚢'}</div>
              <StatusBadge status={v.status} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-0.5">{v.name}</h3>
            <p className="text-sm text-slate-500 mb-3">{v.type}</p>

            <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs mb-3">
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
        ))}
      </div>
    </div>
  );
}
