import React, { useState } from 'react';
import {
  Wrench, AlertTriangle, Package, Plus, Paperclip, Clock,
  Settings, ClipboardList, ShoppingBag, Activity, ChevronRight,
  CheckCircle, FileText
} from 'lucide-react';
import type { Equipment } from '../../types';
import { StatusBadge, CriticalityBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';
import { getJobPlansByEquipment } from '../../data/jobPlans';
import { getJobOrdersByEquipment } from '../../data/jobOrders';
import { getSparesByEquipment } from '../../data/spares';
import { getDefectsByEquipment } from '../../data/defects';
import { useApp } from '../../context/AppContext';

// ── Design tokens ──────────────────────────────────────────────────────────
const PRIMARY = '#4f46e6';
const PRIMARY_DIM = 'rgba(79,70,230,0.12)';
const PRIMARY_BORDER = 'rgba(79,70,230,0.3)';

const glass = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
  ...extra,
});

const glassHover = `
  .glass-card { transition: box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease; }
  .glass-card:hover {
    box-shadow: 0 8px 32px rgba(79,70,230,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9) !important;
    border-color: rgba(79,70,230,0.25) !important;
    transform: translateY(-1px);
  }
  .glass-row { transition: background 0.12s ease; }
  .glass-row:hover { background: rgba(79,70,230,0.04) !important; }
  .glass-btn-primary {
    background: linear-gradient(135deg, #4f46e6 0%, #3730a3 100%);
    color: #fff; border: none; border-radius: 10px;
    padding: 7px 14px; font-size: 12px; font-weight: 600;
    display: inline-flex; align-items: center; gap: 5px;
    cursor: pointer; transition: all 0.15s ease;
    box-shadow: 0 2px 8px rgba(79,70,230,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .glass-btn-primary:hover {
    box-shadow: 0 4px 16px rgba(79,70,230,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    transform: translateY(-1px);
  }
  .glass-btn-secondary {
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: #374151; border: 1px solid rgba(0,0,0,0.1); border-radius: 10px;
    padding: 7px 14px; font-size: 12px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 5px;
    cursor: pointer; transition: all 0.15s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .glass-btn-secondary:hover {
    background: rgba(255,255,255,0.9);
    border-color: rgba(79,70,230,0.25);
    color: #4f46e6;
    box-shadow: 0 4px 12px rgba(79,70,230,0.12), inset 0 1px 0 rgba(255,255,255,0.9);
    transform: translateY(-1px);
  }
  .tab-glass {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 500;
    border: none; cursor: pointer; transition: all 0.15s ease;
    background: transparent; color: rgba(60,60,67,0.55);
    white-space: nowrap;
  }
  .tab-glass:hover {
    background: rgba(79,70,230,0.07);
    color: rgba(60,60,67,0.85);
  }
  .tab-glass.active {
    background: rgba(79,70,230,0.14);
    color: #4338ca;
    box-shadow: inset 0 0 0 1px rgba(79,70,230,0.3);
    font-weight: 600;
  }
  .att-card {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; border-radius: 14px; cursor: pointer;
    transition: all 0.15s ease;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.85);
    box-shadow: 0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9);
  }
  .att-card:hover {
    background: rgba(255,255,255,0.85);
    border-color: rgba(79,70,230,0.2);
    box-shadow: 0 6px 20px rgba(79,70,230,0.1), inset 0 1px 0 rgba(255,255,255,0.9);
    transform: translateY(-2px);
  }
  .timeline-dot {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.7);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.15s;
  }
  .timeline-dot:hover { transform: scale(1.1); }
`;

const tabs = [
  { id: 'overview',     label: 'Overview',     icon: Activity },
  { id: 'jobplans',     label: 'Job Plans',    icon: ClipboardList },
  { id: 'joborders',    label: 'Job Orders',   icon: Wrench },
  { id: 'spares',       label: 'Spares',       icon: ShoppingBag },
  { id: 'defects',      label: 'Defects',      icon: AlertTriangle },
  { id: 'attachments',  label: 'Attachments',  icon: Paperclip },
  { id: 'timeline',     label: 'Timeline',     icon: Clock },
];

interface FieldProps { label: string; value?: string | number | null }
function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</dt>
      <dd style={{ fontSize: 13, color: '#1C1C1E', fontWeight: 500 }}>{value ?? <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>—</span>}</dd>
    </div>
  );
}

const sampleTimeline = [
  { color: 'rgba(16,185,129,0.12)', iconColor: '#059669', icon: CheckCircle,   text: 'Job Order JO-2024-0198 completed and approved',            user: 'Chief Engineer',          time: '1 Dec 2024, 18:45' },
  { color: 'rgba(14,165,233,0.12)', iconColor: '#0284C7', icon: Wrench,        text: 'Job Order JO-2025-0042 generated from JP-ME-001',          user: 'System (Scheduled)',      time: '5 Jan 2025, 06:00' },
  { color: 'rgba(239,68,68,0.12)',  iconColor: '#DC2626', icon: AlertTriangle, text: 'Defect DEF-2025-002 reported — EGT deviation 45°C above avg', user: 'Chief Engineer',       time: '5 Jan 2025, 10:22' },
  { color: 'rgba(245,158,11,0.12)', iconColor: '#D97706', icon: Activity,      text: 'Equipment status changed to Under Maintenance',            user: 'Chief Engineer',          time: '5 Jan 2025, 10:30' },
  { color: 'rgba(100,116,139,0.1)', iconColor: '#475569', icon: Paperclip,     text: 'Inspection report uploaded — ME_Cylinder3_Inspection.pdf', user: 'Chief Engineer',          time: '10 Jan 2025, 14:15' },
  { color: 'rgba(79,70,230,0.1)',   iconColor: '#4f46e6', icon: ClipboardList, text: 'Job Plan JP-ME-001 linked to equipment',                   user: 'Technical Superintendent', time: '20 Mar 2015, 09:00' },
  { color: 'rgba(100,116,139,0.1)', iconColor: '#64748B', icon: Plus,          text: 'Equipment record created — MAHAKALI commissioning',        user: 'Fleet Admin',             time: '20 Mar 2015, 08:30' },
];

const sampleAttachments = [
  { name: 'MAN B&W 6S60MC-C8.2 Instruction Manual',  type: 'PDF',         size: '48.2 MB', uploadedBy: 'Fleet Admin',           date: '20 Mar 2015' },
  { name: 'ME_General_Arrangement_Drawing.pdf',       type: 'PDF',         size: '8.1 MB',  uploadedBy: 'Fleet Admin',           date: '20 Mar 2015' },
  { name: 'ME_Cylinder3_Inspection_Jan2025.pdf',      type: 'PDF',         size: '2.4 MB',  uploadedBy: 'Chief Engineer',        date: '10 Jan 2025' },
  { name: 'LR_Class_Survey_Report_2024.pdf',          type: 'Certificate', size: '1.8 MB',  uploadedBy: 'Tech. Superintendent',  date: '15 Nov 2024' },
  { name: 'ME_Running_Hours_Log_Dec2024.xlsx',        type: 'Report',      size: '0.4 MB',  uploadedBy: 'Chief Engineer',        date: '31 Dec 2024' },
];

const typeIcon: Record<string, string> = { PDF: '📄', Certificate: '🏅', Report: '📊', Image: '🖼️', Drawing: '📐', Other: '📎' };

export function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentRole } = useApp();
  const jobPlans  = getJobPlansByEquipment(equipment.id);
  const jobOrders = getJobOrdersByEquipment(equipment.id);
  const spares    = getSparesByEquipment(equipment.id);
  const defects   = getDefectsByEquipment(equipment.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'transparent' }}>
      <style>{glassHover}</style>

      {/* ── Header ── */}
      <div style={{ ...glass(), borderRadius: '0 0 0 0', borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '14px 20px 12px', flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          {['MAHAKALI', equipment.system || 'Equipment', ...(equipment.parentName ? [equipment.parentName] : [])].map((crumb, i, arr) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: 11, color: i === arr.length - 1 ? '#94A3B8' : '#CBD5E1' }}>{crumb}</span>
              {i < arr.length - 1 && <ChevronRight size={11} color="#D1D5DB" />}
            </React.Fragment>
          ))}
          <ChevronRight size={11} color="#D1D5DB" />
          <span style={{ fontSize: 11, fontWeight: 600, color: PRIMARY }}>{equipment.code}</span>
        </div>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            {/* Code pill */}
            <div style={{
              ...glass({ borderRadius: 10, padding: '6px 10px', flexShrink: 0, marginTop: 2 }),
              fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: PRIMARY,
              boxShadow: `0 2px 8px ${PRIMARY_DIM}, inset 0 1px 0 rgba(255,255,255,0.9)`,
              border: `1px solid ${PRIMARY_BORDER}`,
            }}>
              {equipment.code}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1E', letterSpacing: '-0.4px', lineHeight: 1.2 }}>{equipment.name}</h2>
              {equipment.maker && equipment.model && (
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{equipment.maker} · {equipment.model}</p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {equipment.criticality && <CriticalityBadge criticality={equipment.criticality} />}
            {equipment.status && <StatusBadge status={equipment.status} size="md" />}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="glass-btn-primary"><Wrench size={13} />Create Job Order</button>
          )}
          <button className="glass-btn-secondary"><AlertTriangle size={13} />Report Defect</button>
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="glass-btn-secondary"><Package size={13} />Add Spare</button>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ ...glass({ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }), padding: '6px 14px', display: 'flex', gap: 2, overflowX: 'auto', flexShrink: 0 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-glass ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={12} />
            {tab.label}
            {tab.id === 'joborders' && jobOrders.length > 0 && (
              <span style={{ fontSize: 10, background: activeTab === 'joborders' ? PRIMARY_DIM : 'rgba(0,0,0,0.07)', color: activeTab === 'joborders' ? PRIMARY : '#6B7280', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{jobOrders.length}</span>
            )}
            {tab.id === 'defects' && defects.length > 0 && (
              <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#DC2626', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{defects.length}</span>
            )}
            {tab.id === 'spares' && spares.length > 0 && (
              <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.07)', color: '#6B7280', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{spares.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Technical Info card */}
              <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Technical Information</div>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                  <Field label="Equipment Code"   value={equipment.code} />
                  <Field label="Equipment Type"   value={equipment.type} />
                  <Field label="Maker"            value={equipment.maker} />
                  <Field label="Model / Type No." value={equipment.model} />
                  <Field label="Serial Number"    value={equipment.serial} />
                  <Field label="Drawing Ref"      value={equipment.drawingRef} />
                  <Field label="Class Reference"  value={equipment.classRef} />
                  <Field label="Install Date"     value={equipment.installDate} />
                </dl>
              </div>
              {/* Operational Status card */}
              <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Operational Status</div>
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                  <Field label="Location"          value={equipment.location} />
                  <Field label="Responsible Rank"  value={equipment.responsibleRank} />
                  <Field label="Criticality"       value={equipment.criticality?.toUpperCase()} />
                  <Field label="Current Status"    value={equipment.status} />
                  <Field label="Last Maintenance"  value={equipment.lastMaintenance} />
                  <Field label="Next Due Date"     value={equipment.nextDue} />
                  {equipment.runningHours !== undefined && (
                    <Field label="Running Hours" value={`${equipment.runningHours.toLocaleString()} hrs`} />
                  )}
                  <Field label="Reporting System"  value={equipment.system} />
                </dl>
              </div>
            </div>
            {equipment.description && (
              <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Technical Description & Notes</div>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{equipment.description}</p>
              </div>
            )}
          </div>
        )}

        {/* JOB PLANS */}
        {activeTab === 'jobplans' && (
          <GlassTable
            title="Linked Maintenance Plans"
            action={currentRole !== 'technician' ? <button className="glass-btn-primary"><Plus size={13} />Add Job Plan</button> : undefined}
            empty={jobPlans.length === 0 ? 'No job plans linked to this equipment.' : undefined}
            headers={['Plan Code','Title','Frequency','Last Done','Next Due','Responsible','Status','']}
          >
            {jobPlans.map(jp => (
              <tr key={jp.id} className="glass-row">
                <td style={td}>{jp.code}</td>
                <td style={{ ...td, maxWidth: 200 }}>{jp.title}</td>
                <td style={td}>{jp.interval} {jp.intervalUnit}</td>
                <td style={td}>{jp.lastDone || '—'}</td>
                <td style={{ ...td, fontWeight: 600 }}>{jp.nextDue || '—'}</td>
                <td style={td}>{jp.responsibleRank}</td>
                <td><StatusBadge status={jp.status} /></td>
                <td>{currentRole !== 'technician' && <button style={{ fontSize: 11, color: PRIMARY, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Generate JO</button>}</td>
              </tr>
            ))}
          </GlassTable>
        )}

        {/* JOB ORDERS */}
        {activeTab === 'joborders' && (
          <GlassTable
            title="Work Order History"
            action={currentRole !== 'technician' ? <button className="glass-btn-primary"><Plus size={13} />Create Job Order</button> : undefined}
            empty={jobOrders.length === 0 ? 'No job orders for this equipment.' : undefined}
            headers={['JO Number','Title','Priority','Assigned To','Due Date','Status','Approval']}
          >
            {jobOrders.map(jo => (
              <tr key={jo.id} className="glass-row" style={{ cursor: 'pointer' }}>
                <td style={tdMono}>{jo.joNumber}</td>
                <td style={{ ...td, maxWidth: 200 }}>{jo.title}</td>
                <td><PriorityBadge priority={jo.priority} /></td>
                <td style={td}>{jo.assignedTo}</td>
                <td style={td}>{jo.dueDate}</td>
                <td><StatusBadge status={jo.status} /></td>
                <td>{jo.approvalStatus && <StatusBadge status={jo.approvalStatus} />}</td>
              </tr>
            ))}
          </GlassTable>
        )}

        {/* SPARES */}
        {activeTab === 'spares' && (
          <GlassTable
            title="Spare Parts"
            action={currentRole !== 'technician' ? <button className="glass-btn-primary"><Plus size={13} />Add Spare</button> : undefined}
            empty={spares.length === 0 ? 'No spare parts linked to this equipment.' : undefined}
            headers={['Part Number','Description','Maker','Qty','Min Stock','Status','Location']}
          >
            {spares.map(sp => {
              const outOfStock = sp.qtyOnboard === 0;
              const lowStock   = !outOfStock && sp.qtyOnboard <= sp.minStock;
              return (
                <tr key={sp.id} className="glass-row">
                  <td style={tdMono}>{sp.partNumber}</td>
                  <td style={td}>{sp.description}</td>
                  <td style={td}>{sp.maker}</td>
                  <td style={{ ...td, fontWeight: 700, color: outOfStock ? '#DC2626' : lowStock ? '#D97706' : '#374151', fontSize: 14 }}>{sp.qtyOnboard}</td>
                  <td style={td}>{sp.minStock}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                      background: outOfStock ? 'rgba(239,68,68,0.1)' : lowStock ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                      color: outOfStock ? '#DC2626' : lowStock ? '#D97706' : '#059669',
                      border: `1px solid ${outOfStock ? 'rgba(239,68,68,0.2)' : lowStock ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
                    }}>
                      {outOfStock ? 'Out of Stock' : lowStock ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  <td style={td}>{sp.location}</td>
                </tr>
              );
            })}
          </GlassTable>
        )}

        {/* DEFECTS */}
        {activeTab === 'defects' && (
          <GlassTable
            title="Defect Register"
            action={<button className="glass-btn-secondary"><AlertTriangle size={13} />Report Defect</button>}
            empty={defects.length === 0 ? undefined : undefined}
            emptyNode={defects.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <CheckCircle size={28} color="#10B981" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>No defects recorded</p>
                <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>This equipment has a clean defect record.</p>
              </div>
            ) : undefined}
            headers={['Defect ID','Description','Severity','Reported By','Date','Status','Linked JO']}
          >
            {defects.map(d => (
              <tr key={d.id} className="glass-row">
                <td style={tdMono}>{d.defectId}</td>
                <td style={{ ...td, maxWidth: 220 }}>{d.description}</td>
                <td><SeverityBadge severity={d.severity} /></td>
                <td style={td}>{d.reportedBy}</td>
                <td style={td}>{d.reportedDate}</td>
                <td><StatusBadge status={d.status} /></td>
                <td style={{ ...tdMono, color: PRIMARY }}>{d.linkedJobOrderNumber || '—'}</td>
              </tr>
            ))}
          </GlassTable>
        )}

        {/* ATTACHMENTS */}
        {activeTab === 'attachments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{sampleAttachments.length} documents</span>
              <button className="glass-btn-primary"><Plus size={13} />Upload Document</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {sampleAttachments.map((att, i) => (
                <div key={i} className="att-card">
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{typeIcon[att.type] || '📎'}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{att.size} · {att.uploadedBy}</div>
                    <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 2 }}>{att.date}</div>
                  </div>
                  <button style={{ fontSize: 12, color: PRIMARY, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>↓</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="glass-card" style={{ ...glass({ borderRadius: 16, padding: 20 }) }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E', marginBottom: 20 }}>Equipment Audit Timeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sampleTimeline.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < sampleTimeline.length - 1 ? 20 : 0, position: 'relative' }}>
                  {/* Connector line */}
                  {i < sampleTimeline.length - 1 && (
                    <div style={{ position: 'absolute', left: 17, top: 40, bottom: 0, width: 2, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }} />
                  )}
                  <div className="timeline-dot" style={{ background: event.color, boxShadow: `0 2px 8px ${event.color}` }}>
                    <event.icon size={15} color={event.iconColor} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1C1E', lineHeight: 1.4 }}>{event.text}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                      <span>{event.user}</span>
                      <span>·</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const td: React.CSSProperties    = { fontSize: 12, color: '#374151', padding: '10px 12px', verticalAlign: 'middle' };
const tdMono: React.CSSProperties = { ...td, fontFamily: 'monospace', fontWeight: 600, color: '#64748B' };

// ── Reusable glass table wrapper ───────────────────────────────────────────
function GlassTable({ title, action, headers, children, empty, emptyNode }: {
  title: string; action?: React.ReactNode; headers: string[];
  children: React.ReactNode; empty?: string; emptyNode?: React.ReactNode;
}) {
  const glassStyles = glass({ borderRadius: 16, overflow: 'hidden' });
  return (
    <div style={glassStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{title}</span>
        {action}
      </div>
      {empty ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#94A3B8' }}>{empty}</div>
      ) : emptyNode ? emptyNode : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                {headers.map(h => (
                  <th key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 12px', textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {children}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function EquipmentDetailEmpty() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'rgba(79,70,230,0.08)', border: '1px solid rgba(79,70,230,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
        }}>
          <Settings size={22} color="#4f46e6" strokeWidth={1.5} />
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 6 }}>Select Equipment</h3>
        <p style={{ fontSize: 12, color: '#94A3B8', maxWidth: 240, margin: '0 auto', lineHeight: 1.6 }}>
          Select an equipment item from the tree to view details, maintenance plans, job orders, spares, and history.
        </p>
      </div>
    </div>
  );
}
