import React, { useState } from 'react';
import {
  Wrench, AlertTriangle, Package, Plus, Paperclip, Clock, FileText,
  Settings, ClipboardList, ShoppingBag, Activity, ChevronRight,
  CheckCircle, AlertCircle
} from 'lucide-react';
import type { Equipment } from '../../types';
import { StatusBadge, CriticalityBadge, PriorityBadge, SeverityBadge } from '../../components/ui/StatusBadge';
import { getJobPlansByEquipment } from '../../data/jobPlans';
import { getJobOrdersByEquipment } from '../../data/jobOrders';
import { getSparesByEquipment } from '../../data/spares';
import { getDefectsByEquipment } from '../../data/defects';
import { useApp } from '../../context/AppContext';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'jobplans', label: 'Job Plans', icon: ClipboardList },
  { id: 'joborders', label: 'Job Orders', icon: Wrench },
  { id: 'spares', label: 'Spares', icon: ShoppingBag },
  { id: 'defects', label: 'Defects', icon: AlertTriangle },
  { id: 'attachments', label: 'Attachments', icon: Paperclip },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

interface FieldProps { label: string; value?: string | number | null }
function Field({ label, value }: FieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-900">{value || <span className="text-slate-400 italic">—</span>}</dd>
    </div>
  );
}

const sampleTimeline = [
  { type: 'job_completed', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50', text: 'Job Order JO-2024-0198 completed and approved', user: 'Chief Engineer', time: '1 Dec 2024, 18:45' },
  { type: 'job_order_generated', icon: Wrench, color: 'text-sky-600 bg-sky-50', text: 'Job Order JO-2025-0042 generated from JP-ME-001', user: 'System (Scheduled)', time: '5 Jan 2025, 06:00' },
  { type: 'defect_reported', icon: AlertTriangle, color: 'text-red-600 bg-red-50', text: 'Defect DEF-2025-002 reported — EGT deviation 45°C above avg', user: 'Chief Engineer', time: '5 Jan 2025, 10:22' },
  { type: 'status_changed', icon: Activity, color: 'text-amber-600 bg-amber-50', text: 'Equipment status changed to Under Maintenance', user: 'Chief Engineer', time: '5 Jan 2025, 10:30' },
  { type: 'attachment_uploaded', icon: Paperclip, color: 'text-slate-500 bg-slate-100', text: 'Inspection report uploaded — ME_Cylinder3_Inspection_Jan2025.pdf', user: 'Chief Engineer', time: '10 Jan 2025, 14:15' },
  { type: 'job_plan_added', icon: ClipboardList, color: 'text-purple-600 bg-purple-50', text: 'Job Plan JP-ME-001 linked to equipment', user: 'Technical Superintendent', time: '20 Mar 2015, 09:00' },
  { type: 'created', icon: Plus, color: 'text-slate-600 bg-slate-100', text: 'Equipment record created — MAHAKALI commissioning', user: 'Fleet Admin', time: '20 Mar 2015, 08:30' },
];

const sampleAttachments = [
  { name: 'MAN B&W 6S60MC-C8.2 Instruction Manual', type: 'PDF', size: '48.2 MB', uploadedBy: 'Fleet Admin', date: '20 Mar 2015' },
  { name: 'ME_General_Arrangement_Drawing.pdf', type: 'PDF', size: '8.1 MB', uploadedBy: 'Fleet Admin', date: '20 Mar 2015' },
  { name: 'ME_Cylinder3_Inspection_Jan2025.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: 'Chief Engineer', date: '10 Jan 2025' },
  { name: 'LR_Class_Survey_Report_2024.pdf', type: 'Certificate', size: '1.8 MB', uploadedBy: 'Tech. Superintendent', date: '15 Nov 2024' },
  { name: 'ME_Running_Hours_Log_Dec2024.xlsx', type: 'Report', size: '0.4 MB', uploadedBy: 'Chief Engineer', date: '31 Dec 2024' },
];

const typeIcon: Record<string, string> = {
  PDF: '📄', Certificate: '🏅', Report: '📊', Image: '🖼️', Drawing: '📐', Other: '📎',
};

export function EquipmentDetail({ equipment }: { equipment: Equipment }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { currentRole } = useApp();
  const jobPlans = getJobPlansByEquipment(equipment.id);
  const jobOrders = getJobOrdersByEquipment(equipment.id);
  const spares = getSparesByEquipment(equipment.id);
  const defects = getDefectsByEquipment(equipment.id);

  const getBreadcrumb = () => {
    if (equipment.system) return equipment.system;
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-surface-1 overflow-hidden">
      {/* Equipment Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>MAHAKALI</span>
          <ChevronRight size={12} />
          <span>{equipment.system || 'Equipment'}</span>
          {equipment.parentName && <><ChevronRight size={12} /><span>{equipment.parentName}</span></>}
          <ChevronRight size={12} />
          <span className="text-sky-600 font-medium">{equipment.code}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-slate-700 mt-0.5 flex-shrink-0">
              {equipment.code}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{equipment.name}</h2>
              {equipment.maker && equipment.model && (
                <p className="text-sm text-slate-500 mt-0.5">{equipment.maker} · {equipment.model}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {equipment.criticality && <CriticalityBadge criticality={equipment.criticality} />}
            {equipment.status && <StatusBadge status={equipment.status} size="md" />}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="btn-primary text-xs py-1.5 px-3">
              <Wrench size={13} />
              Create Job Order
            </button>
          )}
          <button className="btn-secondary text-xs py-1.5 px-3">
            <AlertTriangle size={13} />
            Report Defect
          </button>
          {(currentRole === 'admin' || currentRole === 'chief_engineer') && (
            <button className="btn-secondary text-xs py-1.5 px-3">
              <Package size={13} />
              Add Spare
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-5">
        <div className="flex items-center gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button flex items-center gap-1.5 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={13} />
              {tab.label}
              {tab.id === 'joborders' && jobOrders.length > 0 && (
                <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 rounded-full">{jobOrders.length}</span>
              )}
              {tab.id === 'defects' && defects.length > 0 && (
                <span className={`ml-1 text-xs px-1.5 rounded-full ${defects.some(d => d.severity === 'Critical') ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{defects.length}</span>
              )}
              {tab.id === 'spares' && spares.length > 0 && (
                <span className="ml-1 text-xs bg-slate-100 text-slate-600 px-1.5 rounded-full">{spares.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="card p-5">
                <h4 className="section-title mb-4">Technical Information</h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Equipment Code" value={equipment.code} />
                  <Field label="Equipment Type" value={equipment.type} />
                  <Field label="Maker / Manufacturer" value={equipment.maker} />
                  <Field label="Model / Type No." value={equipment.model} />
                  <Field label="Serial Number" value={equipment.serial} />
                  <Field label="Drawing Reference" value={equipment.drawingRef} />
                  <Field label="Class Reference" value={equipment.classRef} />
                  <Field label="Installation Date" value={equipment.installDate} />
                </dl>
              </div>
              <div className="card p-5">
                <h4 className="section-title mb-4">Operational Status</h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Location" value={equipment.location} />
                  <Field label="Responsible Rank" value={equipment.responsibleRank} />
                  <Field label="Criticality" value={equipment.criticality ? equipment.criticality.toUpperCase() : undefined} />
                  <Field label="Current Status" value={equipment.status} />
                  <Field label="Last Maintenance" value={equipment.lastMaintenance} />
                  <Field label="Next Due Date" value={equipment.nextDue} />
                  {equipment.runningHours !== undefined && (
                    <Field label="Running Hours" value={`${equipment.runningHours.toLocaleString()} hrs`} />
                  )}
                  <Field label="Reporting System" value={equipment.system} />
                </dl>
              </div>
            </div>
            {equipment.description && (
              <div className="card p-5">
                <h4 className="section-title mb-3">Technical Description & Notes</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{equipment.description}</p>
              </div>
            )}
          </div>
        )}

        {/* JOB PLANS TAB */}
        {activeTab === 'jobplans' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Linked Maintenance Plans</h3>
              {currentRole !== 'technician' && (
                <button className="btn-primary text-xs py-1.5"><Plus size={13} />Add Job Plan</button>
              )}
            </div>
            {jobPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No job plans linked to this equipment.</div>
            ) : (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Plan Code</th><th>Title</th><th>Frequency</th><th>Last Done</th>
                    <th>Next Due</th><th>Responsible</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {jobPlans.map(jp => (
                    <tr key={jp.id}>
                      <td className="text-xs font-mono text-slate-600">{jp.code}</td>
                      <td className="text-xs font-medium text-slate-800 max-w-xs">{jp.title}</td>
                      <td className="text-xs text-slate-600 whitespace-nowrap">{jp.interval} {jp.intervalUnit}</td>
                      <td className="text-xs text-slate-600">{jp.lastDone || '—'}</td>
                      <td className="text-xs font-medium text-slate-700">{jp.nextDue || '—'}</td>
                      <td className="text-xs text-slate-600">{jp.responsibleRank}</td>
                      <td><StatusBadge status={jp.status} /></td>
                      <td>
                        {currentRole !== 'technician' && (
                          <button className="text-xs text-sky-600 hover:text-sky-700 font-medium whitespace-nowrap">Generate JO</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* JOB ORDERS TAB */}
        {activeTab === 'joborders' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Work Order History</h3>
              {currentRole !== 'technician' && (
                <button className="btn-primary text-xs py-1.5"><Plus size={13} />Create Job Order</button>
              )}
            </div>
            {jobOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No job orders for this equipment.</div>
            ) : (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>JO Number</th><th>Title</th><th>Priority</th><th>Assigned To</th>
                    <th>Due Date</th><th>Status</th><th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {jobOrders.map(jo => (
                    <tr key={jo.id} className="cursor-pointer">
                      <td className="text-xs font-mono text-slate-600">{jo.joNumber}</td>
                      <td className="text-xs font-medium text-slate-800 max-w-xs truncate">{jo.title}</td>
                      <td><PriorityBadge priority={jo.priority} /></td>
                      <td className="text-xs text-slate-600">{jo.assignedTo}</td>
                      <td className="text-xs text-slate-600">{jo.dueDate}</td>
                      <td><StatusBadge status={jo.status} /></td>
                      <td>{jo.approvalStatus && <StatusBadge status={jo.approvalStatus} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SPARES TAB */}
        {activeTab === 'spares' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Spare Parts</h3>
              {currentRole !== 'technician' && (
                <button className="btn-primary text-xs py-1.5"><Plus size={13} />Add Spare</button>
              )}
            </div>
            {spares.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No spare parts linked to this equipment.</div>
            ) : (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Part Number</th><th>Description</th><th>Maker</th>
                    <th>Qty Onboard</th><th>Min Stock</th><th>Stock Status</th><th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {spares.map(sp => {
                    const stockOk = sp.qtyOnboard > sp.minStock;
                    const outOfStock = sp.qtyOnboard === 0;
                    return (
                      <tr key={sp.id}>
                        <td className="text-xs font-mono text-slate-600">{sp.partNumber}</td>
                        <td className="text-xs font-medium text-slate-800">{sp.description}</td>
                        <td className="text-xs text-slate-600">{sp.maker}</td>
                        <td className={`text-sm font-bold ${outOfStock ? 'text-red-600' : !stockOk ? 'text-amber-600' : 'text-slate-700'}`}>{sp.qtyOnboard}</td>
                        <td className="text-xs text-slate-600">{sp.minStock}</td>
                        <td>
                          <span className={`badge ${outOfStock ? 'bg-red-100 text-red-700 border border-red-200' : !stockOk ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {outOfStock ? 'Out of Stock' : !stockOk ? 'Low Stock' : 'OK'}
                          </span>
                        </td>
                        <td className="text-xs text-slate-600">{sp.location}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* DEFECTS TAB */}
        {activeTab === 'defects' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Defect Register</h3>
              <button className="btn-secondary text-xs py-1.5"><AlertTriangle size={13} />Report Defect</button>
            </div>
            {defects.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="mx-auto mb-2 text-emerald-500" size={24} />
                <p className="text-sm text-slate-600 font-medium">No defects recorded</p>
                <p className="text-xs text-slate-400 mt-1">This equipment has a clean defect record.</p>
              </div>
            ) : (
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Defect ID</th><th>Description</th><th>Severity</th>
                    <th>Reported By</th><th>Date</th><th>Status</th><th>Linked JO</th>
                  </tr>
                </thead>
                <tbody>
                  {defects.map(d => (
                    <tr key={d.id}>
                      <td className="text-xs font-mono text-slate-600">{d.defectId}</td>
                      <td className="text-xs text-slate-800 max-w-xs">{d.description}</td>
                      <td><SeverityBadge severity={d.severity} /></td>
                      <td className="text-xs text-slate-600">{d.reportedBy}</td>
                      <td className="text-xs text-slate-600">{d.reportedDate}</td>
                      <td><StatusBadge status={d.status} /></td>
                      <td className="text-xs font-mono text-sky-600">{d.linkedJobOrderNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ATTACHMENTS TAB */}
        {activeTab === 'attachments' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{sampleAttachments.length} documents</p>
              <button className="btn-primary text-xs py-1.5"><Plus size={13} />Upload Document</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sampleAttachments.map((att, i) => (
                <div key={i} className="card p-4 flex items-start gap-3 hover:border-sky-200 transition-colors cursor-pointer">
                  <div className="text-2xl flex-shrink-0">{typeIcon[att.type] || '📎'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{att.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{att.size} · {att.uploadedBy}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{att.date}</div>
                  </div>
                  <button className="text-xs text-sky-600 hover:text-sky-700 font-medium flex-shrink-0 mt-0.5">↓</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Equipment Audit Timeline</h3>
            <div>
              {sampleTimeline.map((event, i) => (
                <div key={i} className="timeline-item">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${event.color}`}>
                    <event.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <div className="text-sm font-medium text-slate-800">{event.text}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
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

export function EquipmentDetailEmpty() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-1 h-full">
      <div className="text-center">
        <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Settings size={24} className="text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">Select Equipment</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Select an equipment item from the tree to view details, maintenance plans, job orders, spares, and history.
        </p>
      </div>
    </div>
  );
}
