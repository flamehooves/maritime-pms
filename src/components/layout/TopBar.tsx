import React, { useState } from 'react';
import { Bell, ChevronDown, Search, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { vessels } from '../../data/vessels';
import type { Role } from '../../types';

const roleConfig: Record<Role, { label: string; short: string }> = {
  admin: { label: 'Fleet Admin', short: 'Admin' },
  chief_engineer: { label: 'Chief Engineer', short: 'Chief Eng' },
  technician: { label: 'Technician', short: 'Technician' },
};

export function TopBar() {
  const { currentRole, setCurrentRole, currentVessel, setCurrentVessel, setSidebarCollapsed, sidebarCollapsed } = useApp();
  const [vesselMenuOpen, setVesselMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const activeVessels = vessels.filter(v => v.status === 'active');

  return (
    <div
      className="flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 flex-shrink-0"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Search */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${searchFocused ? 'border-sky-500 bg-white ring-2 ring-sky-100' : 'border-slate-200 bg-slate-50'}`} style={{ width: '240px' }}>
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
      </div>

      {/* Center - Vessel selector */}
      <div className="relative">
        <button
          onClick={() => setVesselMenuOpen(!vesselMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-sm font-semibold text-slate-800">{currentVessel.name}</span>
          <span className="text-xs text-slate-500 hidden sm:block">{currentVessel.type}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {vesselMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setVesselMenuOpen(false)} />
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white rounded-lg border border-slate-200 shadow-lg z-50 py-1 min-w-56"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Select Vessel
              </div>
              {activeVessels.map(v => (
                <button
                  key={v.id}
                  onClick={() => { setCurrentVessel(v); setVesselMenuOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors text-left ${v.id === currentVessel.id ? 'bg-sky-50' : ''}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <div>
                    <div className={`font-medium ${v.id === currentVessel.id ? 'text-sky-700' : 'text-slate-800'}`}>{v.name}</div>
                    <div className="text-xs text-slate-500">{v.type} · IMO {v.imo}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Role switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['admin', 'chief_engineer', 'technician'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => setCurrentRole(role)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                currentRole === role
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {roleConfig[role].short}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            7
          </span>
        </button>
      </div>
    </div>
  );
}
