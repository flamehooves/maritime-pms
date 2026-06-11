import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const users = [
  { name: 'Rajesh Agarwal', email: 'r.agarwal@pacificmarine.com', role: 'Fleet Administrator', vessel: 'All Fleet', rank: 'Technical Superintendent', status: 'active', lastLogin: 'Jan 11, 2025' },
  { name: 'Capt. E. Singh', email: 'e.singh@mahakali.com', role: 'Chief Engineer', vessel: 'MAHAKALI', rank: 'Chief Engineer', status: 'active', lastLogin: 'Jan 11, 2025' },
  { name: 'John Torres', email: 'j.torres@mahakali.com', role: 'Technician', vessel: 'MAHAKALI', rank: '3rd Engineer', status: 'active', lastLogin: 'Jan 11, 2025' },
  { name: 'K. Pereira', email: 'k.pereira@sealion.com', role: 'Chief Engineer', vessel: 'SEALION SPIRIT', rank: 'Chief Engineer', status: 'active', lastLogin: 'Jan 10, 2025' },
  { name: 'R. Gupta', email: 'r.gupta@mahakali.com', role: 'Technician', vessel: 'MAHAKALI', rank: 'Electrician', status: 'active', lastLogin: 'Jan 10, 2025' },
  { name: 'C. Santos', email: 'c.santos@mahakali.com', role: 'Technician', vessel: 'MAHAKALI', rank: '2nd Officer', status: 'active', lastLogin: 'Jan 9, 2025' },
  { name: 'E. Mendoza', email: 'e.mendoza@pacific.com', role: 'Chief Engineer', vessel: 'PACIFIC TRADER', rank: 'Chief Engineer', status: 'active', lastLogin: 'Jan 8, 2025' },
  { name: 'V. Patel', email: 'v.patel@northernstar.com', role: 'Chief Engineer', vessel: 'NORTHERN STAR', rank: 'Chief Engineer', status: 'active', lastLogin: 'Jan 7, 2025' },
];

const roleBadgeColor: Record<string, string> = {
  'Fleet Administrator': 'bg-sky-100 text-sky-700',
  'Chief Engineer': 'bg-emerald-100 text-emerald-700',
  'Technician': 'bg-amber-100 text-amber-700',
};

export function SettingsPage() {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'users', label: 'Users & Access' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="p-6 min-h-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pacific Marine Management</p>
      </div>

      <div className="flex items-center gap-0 border-b border-slate-200 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-button ${activeTab === t.id ? 'active' : ''}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="max-w-lg space-y-5">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Company Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Company Name', value: 'Pacific Marine Management' },
                { label: 'Timezone', value: 'UTC+8 (Singapore)' },
                { label: 'Date Format', value: 'DD MMM YYYY' },
                { label: 'Units System', value: 'Metric' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input className="input-field" defaultValue={f.value} readOnly={currentRole !== 'admin'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">{users.length} users across all vessels</p>
            {currentRole === 'admin' && (
              <button className="btn-primary text-sm"><Plus size={15} />Invite User</button>
            )}
          </div>
          <div className="card overflow-hidden">
            <table className="w-full data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Vessel</th><th>Rank</th><th>Last Login</th><th>Status</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td className="text-sm font-medium text-slate-800">{u.name}</td>
                    <td className="text-xs text-slate-500">{u.email}</td>
                    <td><span className={`badge ${roleBadgeColor[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                    <td className="text-xs text-slate-600">{u.vessel}</td>
                    <td className="text-xs text-slate-600">{u.rank}</td>
                    <td className="text-xs text-slate-500">{u.lastLogin}</td>
                    <td><span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="max-w-lg">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { label: 'Job Order overdue alert', email: true, inApp: true },
                { label: 'Critical defect reported', email: true, inApp: true },
                { label: 'Approval required', email: true, inApp: true },
                { label: 'Low spare stock alert', email: true, inApp: false },
                { label: 'Job completed for review', email: false, inApp: true },
                { label: 'Equipment status changed', email: false, inApp: true },
                { label: 'Weekly compliance summary', email: true, inApp: false },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{n.label}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-500">
                      <input type="checkbox" defaultChecked={n.email} className="rounded" />Email
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-500">
                      <input type="checkbox" defaultChecked={n.inApp} className="rounded" />In-App
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
