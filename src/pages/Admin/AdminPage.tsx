import React, { useState } from 'react';
import { MdmTable } from '../../components/ui/MdmTable';
import type { ColDef } from '../../components/ui/MdmTable';
import { fetchAuditLogs, fetchCrmUsers } from '../../services/mdmAdminService';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { Loader, AlertCircle, Users, Activity } from 'lucide-react';

// ─── sub-nav ────────────────────────────────────────────────────────────────────
type Section = { key: string; label: string; icon: React.ElementType; group: string };
const SECTIONS: Section[] = [
  { key: 'users',     label: 'Users & Roles', icon: Users,    group: 'Users' },
  { key: 'audit-log', label: 'Audit Log',     icon: Activity, group: 'Monitoring' },
];

// ─── Audit Log columns ────────────────────────────────────────────────────────
const alCols: ColDef[] = [
  { key: 'Action_Time', label: 'Timestamp',  width: '160px' },
  { key: 'User_Name',   label: 'User',       width: '140px' },
  { key: 'Action',      label: 'Action' },
  { key: 'Module',      label: 'Module',     width: '140px' },
  { key: 'IP_Address',  label: 'IP Address', width: '120px' },
];

// ─── Users panel (Zoho CRM Users API — view only) ────────────────────────────
function UsersPanel() {
  const { data: users, loading, error, reload } = useCrmFetch(fetchCrmUsers);
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Users &amp; Roles</h2>
          <p className="text-xs text-slate-500 mt-0.5">Zoho CRM users — managed via Zoho user administration</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader size={18} className="animate-spin" /> Loading users…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <AlertCircle size={16} /> {error}
          <button onClick={reload} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="px-4 py-2.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{users.length} user{users.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ width: 140 }}>Profile</th>
                  <th style={{ width: 120 }}>Role</th>
                  <th style={{ width: 100 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rec = u as Record<string, unknown>;
                  const fullName = String(rec.full_name ?? rec.name ?? '—');
                  const email    = String(rec.email ?? '—');
                  const profile  = String((rec.profile as Record<string, unknown>)?.name ?? rec.profile ?? '—');
                  const role     = String((rec.role as Record<string, unknown>)?.name ?? rec.role ?? '—');
                  const status   = String(rec.status ?? 'active');
                  const initials = fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
                  const colors   = ['#4f46e6', '#0ea5e9', '#059669', '#d97706', '#dc2626'];
                  const bg       = colors[i % colors.length];
                  return (
                    <tr key={String(rec.id ?? i)}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                          <span className="font-medium text-slate-800 text-sm">{fullName}</span>
                        </div>
                      </td>
                      <td><span className="text-slate-600 text-sm">{email}</span></td>
                      <td><span className="text-slate-600 text-sm">{profile}</span></td>
                      <td><span className="text-slate-600 text-sm">{role}</span></td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: status === 'active' ? '#059669' : '#64748b' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [activeKey, setActiveKey] = useState('users');
  const groups = [...new Set(SECTIONS.map(s => s.group))];

  return (
    <div className="flex h-full" style={{ background: '#f8fafc' }}>
      {/* Left sub-nav */}
      <aside
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: 224, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.85)', boxShadow: '1px 0 0 rgba(0,0,0,0.04)' }}
      >
        <div className="px-2 py-3">
          {groups.map((group, gi) => (
            <div key={group}>
              <div style={{ padding: gi === 0 ? '4px 10px 4px' : '16px 10px 4px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(60,60,67,0.35)' }}>
                {group}
              </div>
              {SECTIONS.filter(s => s.group === group).map(sec => {
                const Icon = sec.icon;
                const active = activeKey === sec.key;
                return (
                  <button
                    key={sec.key}
                    onClick={() => setActiveKey(sec.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 14px',
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 500,
                      color: active ? '#4338ca' : 'rgba(60,60,67,0.65)',
                      background: active ? 'rgba(79,70,230,0.14)' : 'transparent',
                      boxShadow: active ? 'inset 0 0 0 1px rgba(79,70,230,0.3)' : 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                      border: 'none',
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(79,70,230,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#1C1C1E'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(60,60,67,0.65)'; } }}
                  >
                    <Icon size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                    {sec.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeKey === 'users'     && <UsersPanel />}
        {activeKey === 'audit-log' && (
          <MdmTable
            key="audit-log"
            title="Audit Log"
            subtitle="Read-only record of all system actions"
            columns={alCols}
            fields={[]}
            emptyDefault={{}}
            fetchFn={fetchAuditLogs}
            createFn={async () => {}}
            updateFn={async () => {}}
            deleteFn={async () => {}}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
