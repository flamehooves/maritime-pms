import React, { useState } from 'react';
import { MdmTable } from '../../components/ui/MdmTable';
import type { ColDef, FieldDef } from '../../components/ui/MdmTable';
import {
  fetchAdminRoles, createAdminRole, updateAdminRole, deleteAdminRole,
  fetchAdminDesignations, createAdminDesignation, updateAdminDesignation, deleteAdminDesignation,
  fetchEmailConfigs, createEmailConfig, updateEmailConfig, deleteEmailConfig,
  fetchEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate,
  fetchAuditLogs,
  fetchDashboardTiles, createDashboardTile, updateDashboardTile, deleteDashboardTile,
  fetchCrmUsers,
} from '../../services/mdmAdminService';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { Loader, AlertCircle, UserPlus, Mail, Shield, Activity, LayoutDashboard, Users } from 'lucide-react';

// ─── sub-nav ────────────────────────────────────────────────────────────────────
type Section = { key: string; label: string; icon: React.ElementType; group: string };
const SECTIONS: Section[] = [
  { key: 'roles',          label: 'Role Creation',       icon: Shield,          group: 'Administration' },
  { key: 'designations',   label: 'User Designations',   icon: Users,           group: 'Administration' },
  { key: 'email-config',   label: 'Email Configuration', icon: Mail,            group: 'Administration' },
  { key: 'email-templates',label: 'Email Templates',     icon: Mail,            group: 'Administration' },
  { key: 'users',          label: 'Users & Roles',       icon: UserPlus,        group: 'Users' },
  { key: 'dashboard-tiles',label: 'Dashboard Tiles',     icon: LayoutDashboard, group: 'Dashboard Admin' },
  { key: 'audit-log',      label: 'Audit Log',           icon: Activity,        group: 'Monitoring' },
];

const STATUS_OPTS = ['Active', 'Inactive'];

// ─── Role panel ──────────────────────────────────────────────────────────────
const roleCols: ColDef[] = [
  { key: 'Name',        label: 'Name' },
  { key: 'Role_Type',   label: 'Type',        width: '140px' },
  { key: 'Description', label: 'Description' },
  { key: 'Status',      label: 'Status',      width: '110px' },
];
const roleFields: FieldDef[] = [
  { key: 'Name',        label: 'Name',        required: true },
  { key: 'Role_Type',   label: 'Role Type',   type: 'select', options: ['System Role', 'Custom Role'] },
  { key: 'Description', label: 'Description', type: 'textarea' },
  { key: 'Permissions', label: 'Permissions', type: 'textarea', placeholder: 'Comma-separated module permissions' },
  { key: 'Status',      label: 'Status',      type: 'select', options: STATUS_OPTS },
];
const roleDefault = { Name: '', Role_Type: 'Custom Role', Description: '', Permissions: '', Status: 'Active' };

// ─── Designation panel ────────────────────────────────────────────────────────
const desgCols: ColDef[] = [
  { key: 'Code',             label: 'Code',        width: '90px' },
  { key: 'Name',             label: 'Name' },
  { key: 'Designation_Type', label: 'Type',        width: '160px' },
  { key: 'Role',             label: 'Role',        width: '140px' },
  { key: 'Rank',             label: 'Rank',        width: '120px' },
  { key: 'Status',           label: 'Status',      width: '110px' },
];
const desgFields: FieldDef[] = [
  { key: 'Name',             label: 'Name',             required: true },
  { key: 'Code',             label: 'Code' },
  { key: 'Designation_Type', label: 'Designation Type', type: 'select', options: ['User Designation', 'Vessel Designation', 'Role Rank Mapping'] },
  { key: 'Role',             label: 'Role',             placeholder: 'e.g. Chief Engineer' },
  { key: 'Department',       label: 'Department' },
  { key: 'Rank',             label: 'Rank',             placeholder: 'e.g. Senior Officer' },
  { key: 'Status',           label: 'Status',           type: 'select', options: STATUS_OPTS },
];
const desgDefault = { Name: '', Code: '', Designation_Type: 'User Designation', Role: '', Department: '', Rank: '', Status: 'Active' };

// ─── Email Config panel ───────────────────────────────────────────────────────
const ecCols: ColDef[] = [
  { key: 'Name',         label: 'Name' },
  { key: 'Host',         label: 'Host' },
  { key: 'Port_Number',  label: 'Port',   width: '80px' },
  { key: 'Config_Type',  label: 'Type',   width: '100px' },
  { key: 'From_Address', label: 'From' },
  { key: 'Status',       label: 'Status', width: '110px' },
];
const ecFields: FieldDef[] = [
  { key: 'Name',         label: 'Name',         required: true },
  { key: 'Host',         label: 'Host',         placeholder: 'e.g. smtp.gmail.com' },
  { key: 'Port_Number',  label: 'Port',         type: 'number' },
  { key: 'Config_Type',  label: 'Config Type',  type: 'select', options: ['SMTP', 'IMAP', 'POP3'] },
  { key: 'From_Address', label: 'From Address', type: 'email' },
  { key: 'Status',       label: 'Status',       type: 'select', options: STATUS_OPTS },
];
const ecDefault = { Name: '', Host: '', Port_Number: 587, Config_Type: 'SMTP', From_Address: '', Status: 'Active' };

// ─── Email Templates panel ────────────────────────────────────────────────────
const etCols: ColDef[] = [
  { key: 'Name',          label: 'Name' },
  { key: 'Template_Type', label: 'Type',    width: '160px' },
  { key: 'Subject',       label: 'Subject' },
  { key: 'Status',        label: 'Status',  width: '110px' },
];
const etFields: FieldDef[] = [
  { key: 'Name',          label: 'Name',          required: true },
  { key: 'Template_Type', label: 'Template Type', type: 'select', options: ['Job Order', 'Defect Alert', 'Approval Request', 'System Notification', 'Report'] },
  { key: 'Subject',       label: 'Subject' },
  { key: 'Body_HTML',     label: 'Body',          type: 'textarea' },
  { key: 'Status',        label: 'Status',        type: 'select', options: STATUS_OPTS },
];
const etDefault = { Name: '', Template_Type: 'Job Order', Subject: '', Body_HTML: '', Status: 'Active' };

// ─── Dashboard Tiles panel ────────────────────────────────────────────────────
const dtCols: ColDef[] = [
  { key: 'Name',       label: 'Name' },
  { key: 'Icon',       label: 'Icon',  width: '80px' },
  { key: 'Route',      label: 'Route' },
  { key: 'Role',       label: 'Role',  width: '140px' },
  { key: 'Sort_Order', label: 'Order', width: '80px' },
  { key: 'Visible',    label: 'Visible', width: '90px', render: (v) => <span className="text-xs font-medium" style={{ color: v ? '#059669' : '#94a3b8' }}>{v ? 'Yes' : 'No'}</span> },
];
const dtFields: FieldDef[] = [
  { key: 'Name',       label: 'Name',       required: true },
  { key: 'Icon',       label: 'Icon',       placeholder: 'e.g. LayoutDashboard' },
  { key: 'Route',      label: 'Route',      placeholder: 'e.g. /dashboard' },
  { key: 'Color',      label: 'Color',      placeholder: 'e.g. #4f46e6' },
  { key: 'Role',       label: 'Role',       type: 'select', options: ['admin', 'chief_engineer', 'technician', 'all'] },
  { key: 'Sort_Order', label: 'Sort Order', type: 'number' },
];
const dtDefault = { Name: '', Icon: '', Route: '', Color: '#4f46e6', Role: 'all', Sort_Order: 0 };

// ─── Audit Log (read-only) ─────────────────────────────────────────────────────
const alCols: ColDef[] = [
  { key: 'Action_Time', label: 'Timestamp',  width: '160px' },
  { key: 'User_Name',   label: 'User',       width: '140px' },
  { key: 'Action',      label: 'Action' },
  { key: 'Module',      label: 'Module',     width: '140px' },
  { key: 'IP_Address',  label: 'IP Address', width: '120px' },
];

// ─── Users panel (Zoho CRM Users API) ────────────────────────────────────────
function UsersPanel() {
  const { data: users, loading, error, reload } = useCrmFetch(fetchCrmUsers);
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Users &amp; Roles</h2>
          <p className="text-xs text-slate-500 mt-0.5">Zoho CRM users — managed via OAuth user API</p>
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
                  const initials = fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                  const colors = ['#4f46e6', '#0ea5e9', '#059669', '#d97706', '#dc2626'];
                  const bg = colors[i % colors.length];
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

export function AdminPage() {
  const [activeKey, setActiveKey] = useState('roles');

  const groups = [...new Set(SECTIONS.map(s => s.group))];

  return (
    <div className="flex h-full" style={{ background: '#f8fafc' }}>
      {/* Left sub-nav */}
      <aside
        className="flex-shrink-0 overflow-y-auto"
        style={{ width: 220, background: '#fff', borderRight: '1px solid #e2e8f0' }}
      >
        {groups.map(group => (
          <div key={group}>
            <div style={{ padding: '12px 16px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#94a3b8', borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
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
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    color: active ? '#0ea5e9' : '#475569',
                    background: active ? '#f0f9ff' : 'transparent',
                    borderLeft: `3px solid ${active ? '#0ea5e9' : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    border: 'none',
                    borderLeftWidth: 3,
                    borderLeftStyle: 'solid',
                    borderLeftColor: active ? '#0ea5e9' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <Icon size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
                  {sec.label}
                </button>
              );
            })}
          </div>
        ))}
      </aside>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeKey === 'roles' && (
          <MdmTable key="roles" title="Role Creation" subtitle="Define system and custom roles"
            columns={roleCols} fields={roleFields} emptyDefault={roleDefault}
            fetchFn={fetchAdminRoles} createFn={createAdminRole} updateFn={updateAdminRole} deleteFn={deleteAdminRole}
          />
        )}
        {activeKey === 'designations' && (
          <MdmTable key="designations" title="User Designations" subtitle="User designations, vessel designations and role-rank mapping"
            columns={desgCols} fields={desgFields} emptyDefault={desgDefault}
            fetchFn={fetchAdminDesignations} createFn={createAdminDesignation} updateFn={updateAdminDesignation} deleteFn={deleteAdminDesignation}
          />
        )}
        {activeKey === 'email-config' && (
          <MdmTable key="email-config" title="Email Configuration" subtitle="SMTP / IMAP / POP3 mail server settings"
            columns={ecCols} fields={ecFields} emptyDefault={ecDefault}
            fetchFn={fetchEmailConfigs} createFn={createEmailConfig} updateFn={updateEmailConfig} deleteFn={deleteEmailConfig}
          />
        )}
        {activeKey === 'email-templates' && (
          <MdmTable key="email-templates" title="Email Templates" subtitle="Notification and alert email templates"
            columns={etCols} fields={etFields} emptyDefault={etDefault}
            fetchFn={fetchEmailTemplates} createFn={createEmailTemplate} updateFn={updateEmailTemplate} deleteFn={deleteEmailTemplate}
          />
        )}
        {activeKey === 'users' && <UsersPanel />}
        {activeKey === 'dashboard-tiles' && (
          <MdmTable key="dashboard-tiles" title="Dashboard Tiles" subtitle="Configure visible tiles and their order on the admin dashboard"
            columns={dtCols} fields={dtFields} emptyDefault={dtDefault}
            fetchFn={fetchDashboardTiles} createFn={createDashboardTile} updateFn={updateDashboardTile} deleteFn={deleteDashboardTile}
          />
        )}
        {activeKey === 'audit-log' && (
          <MdmTable key="audit-log" title="Audit Log" subtitle="Read-only record of all CRM actions performed in the app"
            columns={alCols} fields={[]} emptyDefault={{}}
            fetchFn={fetchAuditLogs} createFn={async () => {}} updateFn={async () => {}} deleteFn={async () => {}}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
