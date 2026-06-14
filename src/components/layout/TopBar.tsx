import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown, Ship } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';
import { vessels } from '../../data/vessels';
import type { Role, Vessel } from '../../types';

const roleConfig: Record<Role, { label: string; short: string }> = {
  admin: { label: 'Fleet Admin', short: 'Admin' },
  chief_engineer: { label: 'Chief Engineer', short: 'Chief Eng' },
  technician: { label: 'Technician', short: 'Technician' },
};

// Pages where vessel selector appears
const VESSEL_SELECTOR_PATHS = ['/equipment', '/job-plans', '/job-orders', '/spares', '/defects', '/reports'];

const ALL_VESSELS_SENTINEL = '__all__';
const ALL_VESSEL: Vessel = { id: ALL_VESSELS_SENTINEL, name: 'All Vessels' } as unknown as Vessel;

function getVesselStatusColor(vs: string | undefined): string {
  switch (vs) {
    case 'at_sea': return '#3b82f6';
    case 'in_port': return '#22c55e';
    case 'in_maintenance': return '#f59e0b';
    case 'drydock': return '#94a3b8';
    default: return '#94a3b8';
  }
}

export function TopBar() {
  const { currentRole, setCurrentRole, setSidebarCollapsed, sidebarCollapsed, currentVessel, setCurrentVessel } = useApp();
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [vesselOpen, setVesselOpen] = useState(false);

  const showVesselSelector = VESSEL_SELECTOR_PATHS.some(
    p => location.pathname === p || location.pathname.startsWith(p + '/')
  );
  const isAllVessels = currentVessel.id === ALL_VESSELS_SENTINEL;

  return (
    <div
      className="flex items-center justify-between px-4 h-14 flex-shrink-0"
      style={{ background: '#F5F5F7', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-white/80 transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Search */}
        <div
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            searchFocused
              ? 'border-blue-300 bg-white ring-2 ring-blue-100'
              : 'border-transparent bg-white/70 hover:bg-white'
          }`}
          style={{ width: '260px', boxShadow: searchFocused ? undefined : '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search equipment, jobs..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <span className="text-xs text-slate-400 hidden sm:block">⌘K</span>
        </div>

        {/* Vessel selector — shown only on relevant pages */}
        {showVesselSelector && (
          <div className="relative">
            <button
              onClick={() => setVesselOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white transition-all"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <Ship size={14} className="text-slate-400 flex-shrink-0" />
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: isAllVessels ? '#94a3b8' : getVesselStatusColor(currentVessel.vesselStatus) }}
              />
              <span className="text-sm font-semibold text-slate-700" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentVessel.name}
              </span>
              <ChevronDown
                size={13}
                className="text-slate-400"
                style={{ transform: vesselOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              />
            </button>

            {vesselOpen && (
              <div
                className="absolute left-0 z-50 rounded-xl overflow-hidden"
                style={{
                  top: 'calc(100% + 6px)',
                  minWidth: 220,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.10)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  maxHeight: 280,
                  overflowY: 'auto',
                }}
              >
                {/* All Vessels */}
                <button
                  onClick={() => { setCurrentVessel(ALL_VESSEL); setVesselOpen(false); }}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                  style={{ background: isAllVessels ? 'rgba(79,70,230,0.06)' : undefined }}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-300" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">All Vessels</div>
                    <div className="text-xs text-slate-400">Fleet-wide view</div>
                  </div>
                </button>
                <div className="mx-3 my-1" style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
                {vessels.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setCurrentVessel(v); setVesselOpen(false); }}
                    className="w-full px-3 py-2.5 text-left flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
                    style={{ background: currentVessel.id === v.id ? 'rgba(79,70,230,0.06)' : undefined }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: getVesselStatusColor(v.vesselStatus) }}
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{v.name}</div>
                      <div className="text-xs text-slate-400">{v.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Role switcher */}
        <div className="flex items-center gap-1 bg-white/80 rounded-xl p-1" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {(['admin', 'chief_engineer', 'technician'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                currentRole === role
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {roleConfig[role].short}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-white transition-colors" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none" style={{ background: '#FF453A', fontSize: '10px' }}>
            7
          </span>
        </button>
      </div>
    </div>
  );
}
