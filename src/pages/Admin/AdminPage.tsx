import React from 'react';
import { fetchCrmUsers } from '../../services/mdmAdminService';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { Loader, AlertCircle } from 'lucide-react';

function UsersPanel() {
  const { data: users, loading, error, reload } = useCrmFetch(fetchCrmUsers);
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">Users &amp; Roles</h2>
        <p className="text-xs text-slate-500 mt-0.5">Zoho CRM users — managed via Zoho user administration</p>
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

export function AdminPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ background: '#f8fafc' }}>
      <UsersPanel />
    </div>
  );
}
