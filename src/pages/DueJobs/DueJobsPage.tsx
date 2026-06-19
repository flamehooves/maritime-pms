import React, { useState } from 'react';
import { Clock, AlertCircle, CalendarClock, CheckCircle, Loader, ChevronRight } from 'lucide-react';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchJobPlans, fetchJobOrders } from '../../services/crmService';
import { useApp } from '../../context/AppContext';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';

function daysDiff(dateStr?: string): number {
  if (!dateStr) return 9999;
  const diff = (new Date(dateStr).getTime() - Date.now()) / 86400000;
  return Math.ceil(diff);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DueJobsPage() {
  const { currentVesselId } = useApp();
  const [tab, setTab] = useState<'plans' | 'orders'>('plans');

  const { data: plans, loading: plansLoading } = useCrmFetch(() => fetchJobPlans(currentVesselId), [currentVesselId]);
  const { data: orders, loading: ordersLoading } = useCrmFetch(() => fetchJobOrders(currentVesselId), [currentVesselId]);

  const loading = plansLoading || ordersLoading;

  const openOrders = orders.filter(jo => jo.status !== 'Completed' && jo.status !== 'Approved');
  const overdueOrders = openOrders.filter(jo => daysDiff(jo.dueDate) < 0).sort((a, b) => daysDiff(a.dueDate) - daysDiff(b.dueDate));
  const dueThisWeek = openOrders.filter(jo => { const d = daysDiff(jo.dueDate); return d >= 0 && d <= 7; });
  const dueThisMonth = openOrders.filter(jo => { const d = daysDiff(jo.dueDate); return d > 7 && d <= 30; });

  const overduePlans = plans.filter(p => p.status === 'Overdue' || (p.nextDue && daysDiff(p.nextDue) < 0));
  const dueSoonPlans = plans.filter(p => p.status === 'Due Soon' || (p.nextDue && daysDiff(p.nextDue) >= 0 && daysDiff(p.nextDue) <= 14));

  type Section = { label: string; color: string; icon: React.ReactNode; items: typeof overdueOrders };
  const orderSections: Section[] = [
    { label: 'Overdue', color: '#DC2626', icon: <AlertCircle size={14} />, items: overdueOrders },
    { label: 'Due This Week', color: '#D97706', icon: <Clock size={14} />, items: dueThisWeek },
    { label: 'Due This Month', color: '#2563EB', icon: <CalendarClock size={14} />, items: dueThisMonth },
  ];

  const td: React.CSSProperties = { fontSize: 12, color: '#374151', padding: '9px 14px', verticalAlign: 'middle' };

  return (
    <div style={{ padding: 24, minHeight: '100%', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={15} color="#DC2626" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1E' }}>Due Jobs</h1>
        </div>
        <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 42 }}>Overdue and upcoming maintenance jobs requiring attention</p>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Overdue Orders', value: overdueOrders.length, color: '#DC2626', bg: 'rgba(220,38,38,0.07)' },
          { label: 'Due This Week', value: dueThisWeek.length, color: '#D97706', bg: 'rgba(245,158,11,0.07)' },
          { label: 'Due This Month', value: dueThisMonth.length, color: '#2563EB', bg: 'rgba(37,99,235,0.07)' },
          { label: 'Overdue Plans', value: overduePlans.length, color: '#7C3AED', bg: 'rgba(124,58,237,0.07)' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{loading ? '…' : k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, overflow: 'hidden', width: 'fit-content', marginBottom: 16 }}>
        {(['orders', 'plans'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', fontSize: 12, fontWeight: tab === t ? 700 : 500, background: tab === t ? '#4f46e6' : 'transparent', color: tab === t ? '#fff' : '#6B7280', border: 'none', cursor: 'pointer', transition: 'all 0.12s', textTransform: 'capitalize' }}>{t === 'orders' ? 'Job Orders' : 'Job Plans'}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 60, color: '#94A3B8', fontSize: 13 }}>
          <Loader size={16} className="animate-spin" />Loading…
        </div>
      ) : tab === 'orders' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orderSections.map(sec => (
            <div key={sec.label} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: sec.color }}>{sec.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: sec.color }}>{sec.label}</span>
                <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>{sec.items.length} job{sec.items.length !== 1 ? 's' : ''}</span>
              </div>
              {sec.items.length === 0 ? (
                <div style={{ padding: '24px 18px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
                  <CheckCircle size={20} style={{ margin: '0 auto 8px', color: '#34D399' }} />No {sec.label.toLowerCase()} job orders
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                      {['JO No.', 'Equipment', 'Title', 'Assigned To', 'Priority', 'Due Date', 'Days', 'Status'].map(h => (
                        <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.map(jo => {
                      const days = daysDiff(jo.dueDate);
                      return (
                        <tr key={jo.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.015)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                          <td style={{ ...td, fontFamily: 'monospace', color: '#4f46e6', fontWeight: 700 }}>{jo.joNumber}</td>
                          <td style={{ ...td, fontWeight: 600 }}>{jo.equipmentName}</td>
                          <td style={{ ...td, maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jo.title}</span></td>
                          <td style={td}>{jo.assignedTo || '—'}</td>
                          <td><PriorityBadge priority={jo.priority} /></td>
                          <td style={td}>{formatDate(jo.dueDate)}</td>
                          <td style={{ ...td, fontWeight: 700, color: days < 0 ? '#DC2626' : days <= 7 ? '#D97706' : '#2563EB' }}>{days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</td>
                          <td><StatusBadge status={jo.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>Overdue & Due-Soon Job Plans</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{overduePlans.length + dueSoonPlans.length} plans</span>
          </div>
          {overduePlans.length === 0 && dueSoonPlans.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
              <CheckCircle size={20} style={{ margin: '0 auto 8px', color: '#34D399' }} />All job plans are on schedule
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                  {['Plan Code', 'Equipment', 'Title', 'Frequency', 'Last Done', 'Next Due', 'Days', 'Status'].map(h => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 14px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...overduePlans, ...dueSoonPlans].map(plan => {
                  const days = daysDiff(plan.nextDue);
                  return (
                    <tr key={plan.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#4f46e6', fontWeight: 700 }}>{plan.code}</td>
                      <td style={{ ...td, fontWeight: 600 }}>{plan.equipmentName}</td>
                      <td style={{ ...td, maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.title}</span></td>
                      <td style={td}>{plan.interval} {plan.intervalUnit}</td>
                      <td style={td}>{formatDate(plan.lastDone)}</td>
                      <td style={td}>{formatDate(plan.nextDue)}</td>
                      <td style={{ ...td, fontWeight: 700, color: days < 0 ? '#DC2626' : '#D97706' }}>{days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: days < 0 ? 'rgba(220,38,38,0.08)' : 'rgba(245,158,11,0.08)', color: days < 0 ? '#DC2626' : '#D97706', border: `1px solid ${days < 0 ? 'rgba(220,38,38,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                          {days < 0 ? 'Overdue' : 'Due Soon'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
