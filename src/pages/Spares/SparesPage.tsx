import React, { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, Loader, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchSpareParts } from '../../services/crmService';

export function SparesPage() {
  const { currentRole, currentVesselId } = useApp();
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('All');

  const { data: spareParts, loading, error, reload } = useCrmFetch(
    () => fetchSpareParts(currentVesselId),
    [currentVesselId]
  );

  const lowStock = spareParts.filter(sp => sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0);
  const outOfStock = spareParts.filter(sp => sp.qtyOnboard === 0);

  const filtered = spareParts.filter(sp => {
    const matchSearch = !search ||
      sp.description.toLowerCase().includes(search.toLowerCase()) ||
      sp.partNumber.toLowerCase().includes(search.toLowerCase());
    const matchStock =
      stockFilter === 'All' ||
      (stockFilter === 'Low' && sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0) ||
      (stockFilter === 'Out' && sp.qtyOnboard === 0) ||
      (stockFilter === 'Critical' && sp.isCritical);
    return matchSearch && matchStock;
  });

  return (
    <div className="p-6 min-h-full w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Spare Parts Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Loading…' : `${spareParts.length} spare parts tracked`}
          </p>
        </div>
        {currentRole !== 'technician' && (
          <button className="btn-primary"><Plus size={16} />Add Part</button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 mb-4">
          <AlertCircle size={18} /><span>{error}</span>
          <button onClick={reload} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg border border-slate-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><Package size={14} className="text-slate-500" /><span className="text-xs text-slate-500">Total Parts</span></div>
          <div className="text-xl font-bold text-slate-900 mt-1">{spareParts.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-red-100 p-3" style={{ background: '#FFF5F5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-red-500" /><span className="text-xs text-red-600">Critical Spares</span></div>
          <div className="text-xl font-bold text-red-700 mt-1">{spareParts.filter(s => s.isCritical).length}</div>
        </div>
        <div className="bg-white rounded-lg border border-amber-100 p-3" style={{ background: '#eef2ff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /><span className="text-xs text-amber-600">Low Stock</span></div>
          <div className="text-xl font-bold text-amber-700 mt-1">{lowStock.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="text-xs text-red-600">Out of Stock</div>
          <div className="text-xl font-bold text-red-700 mt-1">{outOfStock.length}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search parts..." className="text-sm text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1">
          {['All', 'Low', 'Out', 'Critical'].map(f => (
            <button key={f} onClick={() => setStockFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stockFilter === f ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f === 'Out' ? 'Out of Stock' : f === 'Critical' ? 'Critical Only' : f === 'Low' ? 'Low Stock' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader size={18} className="animate-spin" /> Loading from Zoho CRM…
          </div>
        ) : (
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Part Number</th><th>Description</th><th>Equipment</th><th>Maker</th>
                <th>Qty</th><th>Min Stock</th><th>Stock Status</th><th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sp => {
                const outOfStk = sp.qtyOnboard === 0;
                const low = sp.qtyOnboard <= sp.minStock && sp.qtyOnboard > 0;
                return (
                  <tr key={sp.id}>
                    <td className="text-xs font-mono text-slate-600">{sp.partNumber || '—'}</td>
                    <td className="text-xs font-medium text-slate-800 max-w-xs">{sp.description}</td>
                    <td className="text-xs text-slate-600 truncate max-w-32">{sp.equipmentName || '—'}</td>
                    <td className="text-xs text-slate-600">{sp.maker || '—'}</td>
                    <td className={`text-sm font-bold ${outOfStk ? 'text-red-600' : low ? 'text-amber-600' : 'text-slate-700'}`}>{sp.qtyOnboard}</td>
                    <td className="text-xs text-slate-600">{sp.minStock}</td>
                    <td>
                      <span className={`badge ${outOfStk ? 'bg-red-100 text-red-700 border border-red-200' : low ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {outOfStk ? 'Out of Stock' : low ? 'Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-600">{sp.location || '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No spare parts found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          {filtered.length} of {spareParts.length} parts
        </div>
      </div>
    </div>
  );
}
