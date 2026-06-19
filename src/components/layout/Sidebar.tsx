import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ship, Cog, ClipboardList, Wrench, Package,
  AlertTriangle, CheckSquare, BarChart3, Settings, ChevronLeft,
  ChevronRight, Anchor, LogOut, User, ChevronUp, Mail, Shield,
  Clock, Gauge, ClipboardCheck, Map
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';

type NavItem = { path: string; label: string; icon: React.ElementType; roles: Role[]; section?: string };

const allNavItems: NavItem[] = [
  { path: '/',          label: 'Dashboard',        icon: LayoutDashboard,  roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/vessels',   label: 'Vessels',           icon: Ship,             roles: ['admin', 'chief_engineer'] },
  { path: '/fleet-map', label: 'Fleet Map',         icon: Map,              roles: ['admin', 'chief_engineer'] },
  // MAINTENANCE section
  { path: '/equipment',          label: 'Equipments',        icon: Cog,            roles: ['admin', 'chief_engineer', 'technician'], section: 'MAINTENANCE' },
  { path: '/due-jobs',           label: 'Due Jobs',          icon: Clock,          roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/job-orders',         label: 'Job Orders',        icon: Wrench,         roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/running-hours',      label: 'Running Hours',     icon: Gauge,          roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/tom-forms',          label: 'TOM Forms',         icon: ClipboardCheck, roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/reports',            label: 'Reports',           icon: BarChart3,      roles: ['admin', 'chief_engineer'] },
  { path: '/guarantee-claims',   label: 'Guarantee Claims',  icon: Shield,         roles: ['admin', 'chief_engineer'] },
  // Other
  { path: '/job-plans',  label: 'Job Plans',  icon: ClipboardList, roles: ['admin', 'chief_engineer'], section: 'OTHER' },
  { path: '/spares',     label: 'Spares',     icon: Package,       roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/defects',    label: 'Defects',    icon: AlertTriangle, roles: ['admin', 'chief_engineer', 'technician'] },
  { path: '/approvals',  label: 'Approvals',  icon: CheckSquare,   roles: ['admin', 'chief_engineer'] },
  { path: '/settings',   label: 'Settings',   icon: Settings,      roles: ['admin'] },
];

const roleLabels: Record<Role, { label: string; color: string }> = {
  admin: { label: 'Fleet Administrator', color: 'bg-blue-500' },
  chief_engineer: { label: 'Chief Engineer', color: 'bg-emerald-500' },
  technician: { label: 'Technician', color: 'bg-amber-500' },
};

const roleNames: Record<Role, string> = {
  admin: 'Fleet Admin',
  chief_engineer: 'Chief Engineer',
  technician: 'Technician',
};

export function Sidebar() {
  const { currentRole, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const visibleItems = allNavItems.filter(item => item.roles.includes(currentRole));
  const roleInfo = roleLabels[currentRole];

  const displayName = user?.full_name ?? roleNames[currentRole];
  const displayRole = user?.profile ?? user?.role ?? roleInfo.label;
  const displayEmail = user?.email ?? '';
  const profilePic = user?.profile_pic as string | undefined;
  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();

  // Close popover on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

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
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#4f46e6' }}>
            <Anchor size={16} color="white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <span className="text-white font-semibold text-sm tracking-tight">PalLite</span>
              <div className="text-xs" style={{ color: '#6B7280' }}>PMS Platform</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {visibleItems.map((item, idx) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const showSectionLabel = !sidebarCollapsed && item.section;
            return (
              <React.Fragment key={item.path}>
                {showSectionLabel && (
                  <div style={{ padding: idx === 0 ? '8px 10px 4px' : '16px 10px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
                    {item.section}
                  </div>
                )}
                <NavLink
                  to={item.path}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={() =>
                    `flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
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
              </React.Fragment>
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

      {/* User section with profile popover */}
      <div className="border-t px-2 py-2 relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }} ref={popoverRef}>

        {/* Profile popover */}
        {profileOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: sidebarCollapsed ? '4px' : '8px',
              right: '8px',
              minWidth: sidebarCollapsed ? 200 : undefined,
              background: '#1f2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
              padding: '4px',
              zIndex: 50,
            }}
          >
            {/* User info card */}
            <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden ${profilePic ? '' : `flex items-center justify-center text-white text-sm font-bold ${roleInfo.color}`}`}>
                  {profilePic
                    ? <img src={profilePic} alt={displayName} className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-sm font-semibold truncate">{displayName}</div>
                  <div className="text-xs truncate" style={{ color: '#9CA3AF' }}>{displayRole}</div>
                </div>
              </div>
              {displayEmail && (
                <div className="flex items-center gap-2 mt-2" style={{ color: '#6B7280' }}>
                  <Mail size={12} />
                  <span className="text-xs truncate">{displayEmail}</span>
                </div>
              )}
            </div>

            {/* Menu items */}
            <div style={{ padding: '4px 0' }}>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#D1D5DB' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={15} style={{ color: '#9CA3AF' }} />
                My Profile
              </button>
              <button
                onClick={() => setProfileOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#D1D5DB' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Shield size={15} style={{ color: '#9CA3AF' }} />
                Account Settings
              </button>
            </div>

            {/* Logout */}
            <div style={{ padding: '4px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { setProfileOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{ color: '#F87171' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setProfileOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors"
          style={{ background: profileOpen ? 'rgba(255,255,255,0.08)' : 'transparent' }}
          onMouseEnter={e => { if (!profileOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = 'transparent'; }}
          title={sidebarCollapsed ? displayName : undefined}
        >
          <div className={`w-8 h-8 rounded-full flex-shrink-0 overflow-hidden ${profilePic ? '' : `flex items-center justify-center text-white text-xs font-bold ${roleInfo.color}`}`}>
            {profilePic
              ? <img src={profilePic} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-white text-xs font-medium truncate">{displayName}</div>
                <div className="text-xs truncate" style={{ color: '#6B7280' }}>{displayRole}</div>
              </div>
              <ChevronUp
                size={13}
                style={{
                  color: '#6B7280',
                  transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
