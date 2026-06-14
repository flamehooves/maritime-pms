import React, { useState, useCallback } from 'react';
import { CheckSquare, X, Eye, Loader, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { PriorityBadge } from '../../components/ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import {
  fetchJobOrdersForApproval,
  fetchApprovalHistory,
  approveJobOrder,
  rejectJobOrder,
} from '../../services/crmService';
import type { JobOrder } from '../../types';

const typeColor = 'bg-sky-50 text-sky-700 border border-sky-200';

function RejectModal({
  item,
  onConfirm,
  onCancel,
}: {
  item: JobOrder;
  onConfirm: (remarks: string) => void;
  onCancel: () => void;
}) {
  const [remarks, setRemarks] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Reject Job Order</h3>
        <p className="text-xs text-slate-500 mb-4">{item.joNumber} — {item.title}</p>
        <textarea
          className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
          rows={3}
          placeholder="Reason for rejection (optional)…"
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button
            onClick={() => onConfirm(remarks)}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export function ApprovalsPage() {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectTarget, setRejectTarget] = useState<JobOrder | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const {
    data: pending,
    loading: pendingLoading,
    error: pendingError,
    reload: reloadPending,
  } = useCrmFetch(fetchJobOrdersForApproval, [activeTab]);

  const {
    data: history,
    loading: historyLoading,
    error: historyError,
    reload: reloadHistory,
  } = useCrmFetch(fetchApprovalHistory, [activeTab]);

  const handleApprove = useCallback(async (jo: JobOrder) => {
    setProcessing(s => new Set(s).add(jo.id));
    try {
      await approveJobOrder(jo.id);
      reloadPending();
      reloadHistory();
    } finally {
      setProcessing(s => { const n = new Set(s); n.delete(jo.id); return n; });
    }
  }, [reloadPending, reloadHistory]);

  const handleReject = useCallback(async (jo: JobOrder, remarks: string) => {
    setRejectTarget(null);
    setProcessing(s => new Set(s).add(jo.id));
    try {
      await rejectJobOrder(jo.id, remarks);
      reloadPending();
      reloadHistory();
    } finally {
      setProcessing(s => { const n = new Set(s); n.delete(jo.id); return n; });
    }
  }, [reloadPending, reloadHistory]);

  const loading = activeTab === 'pending' ? pendingLoading : historyLoading;
  const error   = activeTab === 'pending' ? pendingError  : historyError;

  return (
    <div className="p-6 min-h-full w-full">
      {rejectTarget && (
        <RejectModal
          item={rejectTarget}
          onConfirm={r => handleReject(rejectTarget, r)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Approval Queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentRole === 'admin' ? 'Fleet-wide' : 'Current Vessel'} ·{' '}
            {pendingLoading ? '…' : pending.length} pending
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 mb-5">
        {[
          { key: 'pending', label: `Pending (${pendingLoading ? '…' : pending.length})` },
          { key: 'history', label: `History (${historyLoading ? '…' : history.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`tab-button ${activeTab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
          <button onClick={activeTab === 'pending' ? reloadPending : reloadHistory} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {/* Pending list */}
      {activeTab === 'pending' && !loading && !error && (
        <div className="space-y-3">
          {pending.map(jo => {
            const busy = processing.has(jo.id);
            return (
              <div key={jo.id} className="card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${typeColor}`}>Job Order</span>
                      <PriorityBadge priority={jo.priority} />
                      <span className="text-xs font-mono text-slate-400">{jo.joNumber}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{jo.title}</h3>
                    {jo.remarks && <p className="text-xs text-slate-500 mb-2">{jo.remarks}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {jo.vessel && <span>Vessel: <span className="text-slate-600 font-medium">{jo.vessel}</span></span>}
                      {jo.assignedTo && <span>By: <span className="text-slate-600">{jo.assignedTo}</span></span>}
                      {jo.dueDate && <span className="flex items-center gap-1"><Clock size={11} />{jo.dueDate}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      disabled={busy}
                      onClick={() => setRejectTarget(jo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {busy ? <Loader size={12} className="animate-spin" /> : <X size={13} />}Reject
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleApprove(jo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {busy ? <Loader size={12} className="animate-spin" /> : <CheckSquare size={13} />}Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {pending.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <CheckSquare size={32} className="mx-auto mb-3 text-emerald-400" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No job orders awaiting review.</p>
            </div>
          )}
        </div>
      )}

      {/* History list */}
      {activeTab === 'history' && !loading && !error && (
        <div className="space-y-3">
          {history.map(jo => {
            const isApproved = jo.status === 'Approved';
            return (
              <div key={jo.id} className="card p-4 opacity-80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${typeColor}`}>Job Order</span>
                      <span className={`badge ${isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {isApproved ? 'Approved' : 'Rejected'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{jo.joNumber}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">{jo.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {jo.vessel && <span>Vessel: <span className="text-slate-600 font-medium">{jo.vessel}</span></span>}
                      {jo.assignedTo && <span>By: <span className="text-slate-600">{jo.assignedTo}</span></span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
                    {isApproved
                      ? <CheckSquare size={16} className="text-emerald-500" />
                      : <RotateCcw size={16} className="text-red-400" />}
                  </div>
                </div>
              </div>
            );
          })}
          {history.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Eye size={28} className="mx-auto mb-3" />
              <p className="text-sm">No resolved approvals yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
