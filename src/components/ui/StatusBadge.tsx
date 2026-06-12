import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { label: string; classes: string }> = {
  // Equipment status
  operational: { label: 'Operational', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  under_maintenance: { label: 'Under Maintenance', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  defect: { label: 'Defect', classes: 'bg-red-50 text-red-700 border border-red-200' },
  inactive: { label: 'Inactive', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  // Job order status
  'Not Started': { label: 'Not Started', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  'In Progress': { label: 'In Progress', classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
  'On Hold': { label: 'On Hold', classes: 'bg-orange-50 text-orange-700 border border-orange-200' },
  'Completed': { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'Awaiting Review': { label: 'Awaiting Review', classes: 'bg-purple-50 text-purple-700 border border-purple-200' },
  'Approved': { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'Reopened': { label: 'Reopened', classes: 'bg-red-50 text-red-700 border border-red-200' },
  'Overdue': { label: 'Overdue', classes: 'bg-red-50 text-red-700 border border-red-200' },
  'Due Soon': { label: 'Due Soon', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'Active': { label: 'Active', classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
  'Inactive': { label: 'Inactive', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  // Defect status
  'Open': { label: 'Open', classes: 'bg-red-50 text-red-700 border border-red-200' },
  'Under Investigation': { label: 'Under Investigation', classes: 'bg-orange-50 text-orange-700 border border-orange-200' },
  'Resolved': { label: 'Resolved', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'Closed': { label: 'Closed', classes: 'bg-slate-100 text-slate-600 border border-slate-200' },
  // Approval
  'Pending': { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border border-amber-200' },
  'Rejected': { label: 'Rejected', classes: 'bg-red-50 text-red-700 border border-red-200' },
  'N/A': { label: 'N/A', classes: 'bg-slate-100 text-slate-500 border border-slate-200' },
  // Vessel status
  'active': { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  'drydock': { label: 'Dry Dock', classes: 'bg-sky-50 text-sky-700 border border-sky-200' },
};

const priorityMap: Record<string, string> = {
  Critical: 'bg-red-50 text-red-800 border border-red-200',
  High: 'bg-orange-50 text-orange-800 border border-orange-200',
  Medium: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  Low: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const severityMap: Record<string, string> = {
  Critical: 'bg-red-100 text-red-800 border border-red-300 font-semibold',
  High: 'bg-orange-50 text-orange-800 border border-orange-200',
  Medium: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  Low: 'bg-slate-100 text-slate-700 border border-slate-200',
};

const criticalityMap: Record<string, string> = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  high: 'bg-orange-50 text-orange-700 border border-orange-200',
  medium: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  low: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusMap[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  if (!config) return <span className={`inline-flex items-center rounded font-medium ${sizeClass} bg-slate-100 text-slate-600`}>{status}</span>;
  return (
    <span className={`inline-flex items-center rounded font-medium ${sizeClass} ${config.classes}`}>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const classes = priorityMap[priority] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded text-xs font-semibold px-2 py-0.5 ${classes}`}>
      {priority}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const classes = severityMap[severity] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded text-xs font-semibold px-2 py-0.5 ${classes}`}>
      {severity}
    </span>
  );
}

export function CriticalityBadge({ criticality }: { criticality: string }) {
  const classes = criticalityMap[criticality] || 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded text-xs font-medium px-2 py-0.5 ${classes} uppercase tracking-wide`}>
      {criticality}
    </span>
  );
}
