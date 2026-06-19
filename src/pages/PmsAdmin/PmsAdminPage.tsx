import React from 'react';
import { SlidersHorizontal, Construction } from 'lucide-react';

export function PmsAdminPage() {
  return (
    <div style={{ padding: 24, minHeight: '100%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(79,70,230,0.08)', border: '1px solid rgba(79,70,230,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <SlidersHorizontal size={28} color="#4f46e6" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1C1C1E', marginBottom: 8 }}>PMS Administration</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <Construction size={14} color="#D97706" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#D97706' }}>Coming Soon</span>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
          Central administration panel for configuring the PMS. Manage system groups,
          frequency types, approval workflows, user permissions, and integration settings.
        </p>
        <div style={{ marginTop: 20, padding: '12px 16px', background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Planned Features</div>
          {['System group & equipment code setup', 'Frequency & interval configuration', 'User role & permission management', 'Approval workflow builder', 'CRM field mapping configuration', 'Notification & email templates'].map(f => (
            <div key={f} style={{ fontSize: 12, color: '#374151', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1', flexShrink: 0 }} />{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
