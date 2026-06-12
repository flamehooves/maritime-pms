import React, { useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Role } from '../../types';

const roleConfig: Record<Role, { label: string; short: string }> = {
  admin: { label: 'Fleet Admin', short: 'Admin' },
  chief_engineer: { label: 'Chief Engineer', short: 'Chief Eng' },
  technician: { label: 'Technician', short: 'Technician' },
};

export function TopBar() {
  const { currentRole, setCurrentRole, setSidebarCollapsed, sidebarCollapsed } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

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
