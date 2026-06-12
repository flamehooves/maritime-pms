import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ship, Cog, ClipboardList, Wrench, Package,
  AlertTriangle, CheckSquare, BarChart3, Settings, ChevronLeft,
  ChevronRight, Anchor, LayoutGrid, ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { vessels } from '../../data/vessels';
import type { Role } from '../../types';

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/vessels', label: 'Vessel Register', icon: Ship, roles: ['admin', 'chief_engineer'] as Role[] },
  { path: '/equipment', label: 'Equipment', icon: Cog, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/equipment/overview', label: 'Equip. Overview', icon: LayoutGrid, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/job-plans', label: 'Job Plans', icon: ClipboardList, roles: ['admin', 'chief_engineer'] as Role[] },
  { path: '/job-orders', label: 'Job Orders', icon: Wrench, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/spares', label: 'Spares', icon: Package, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/defects', label: 'Defects', icon: AlertTriangle, roles: ['admin', 'chief_engineer', 'technician'] as Role[] },
  { path: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['admin', 'chief_engineer'] as Role[] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'chief_engineer'] as Role[] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] as Role[] },
];

const roleLabels: Record<Role, { label: string; color: string }> = {
  admin: { label: 'Fleet Administrator', color: 'bg-blue-500' },
  chief_engineer: { label: 'Chief Engineer', color: 'bg-emerald-500' },
  technician: { label: 'Technician', color: 'bg-amber-500' },
};

const roleAvatars: Record<Role, string> = {
  admin: 'RA',
  chief_engineer: 'CE',
  technician: 'JT',
};

const roleNames: Record<Role, string> = {
  admin: 'Rajesh Agarwal',
  chief_engineer: 'Capt. E. Singh',
  technician: 'John Torres',
};

function getVesselStatusColor(vs: string | undefined): string {
  switch (vs) {
    case 'at_sea': return '#3b82f6';
    case 'in_port': return '#22c55e';
    case 'in_maintenance': return '#f59e0b';
    case 'drydock': return '#94a3b8';
    default: return '#94a3b8';
  }
}

export function Sidebar() {
  const { currentRole, sidebarCollapsed, setSidebarCollapsed, currentVessel, setCurrentVessel } = useApp();
  const location = useLocation();
  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));
  const roleInfo = roleLabels[currentRole];
  const [vesselDropdownOpen, setVesselDropdownOpen] = useState(false);

  return (
    <div
      className="flex flex-col h-full transition-all duration-200"
      style={{
        width: sidebarCollapsed ? '56px' : '224px',
        background: '#111827',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center px-3 h-14 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f6' }}>
            <Anchor size={16} color="white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">MarineOps</span>
              <div className="text-xs" style={{ color: '#6B7280' }}>PMS Platform</div>
            </div>
          )}
        </div>
      </div>

      {/* Vessel selector */}
      {!sidebarCollapsed && (
        <div className="px-3 mt-3 relative">
          <button
            onClick={() => setVesselDropdownOpen(o => !o)}
            className="w-full rounded-xl px-3 py-2.5 text-left transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div className="text-xs font-medium mb-0.5" style={{ color: '#6B7280' }}>Current Vessel</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: getVesselStatusColor(currentVessel.vesselStatus) }}
                ></div>
                <span className="text-sm font-semibold text-white truncate" style={{ maxWidth: 120 }}>{currentVessel.name}</span>
              </div>
              <ChevronDown
                size={13}
                style={{
                  color: '#6B7280',
                  transform: vesselDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              />
            </div>
          </button>

          {vesselDropdownOpen && (
            <div
              className="absolute left-3 right-3 z-50 rounded-xl overflow-hidden"
              style={{
                top: 'calc(100% + 4px)',
                background: '#1f2937',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {vessels.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setCurrentVessel(v);
                    setVesselDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 transition-colors"
                  style={{
                    background: currentVessel.id === v.id ? 'rgba(59,130,246,0.2)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (currentVessel.id !== v.id) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { if (currentVessel.id !== v.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: getVesselStatusColor(v.vesselStatus) }}
                  ></div>
                  <div>
                    <div className="text-xs font-semibold text-white leading-tight">{v.name}</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>{v.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={() =>
                  `flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`
                }
                style={({ isActive: active }) => active
                  ? { background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }
                  : {}
                }
              >
                <item.icon size={16} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="mx-2 mb-2 p-2 rounded-xl transition-colors flex items-center justify-center"
        style={{ color: '#6B7280' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* User section */}
      <div className="border-t px-3 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${roleInfo.color}`}>
            {roleAvatars[currentRole]}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="text-white text-xs font-medium truncate">{roleNames[currentRole]}</div>
              <div className="text-xs truncate" style={{ color: '#6B7280' }}>{roleInfo.label}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
