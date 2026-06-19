import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader, AlertTriangle, Navigation, RefreshCw, Anchor } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCrmFetch } from '../../hooks/useCrmFetch';
import { fetchVessels, updateVesselPosition } from '../../services/crmService';
import type { Vessel } from '../../types';

// Fix leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Demo positions for seeding — realistic maritime routes
const DEMO_POSITIONS: Record<string, { lat: number; lng: number; mmsi: string }> = {
  'AURORA PRINCESS':  { lat: 18.3,   lng: -66.1,  mmsi: '311000123' }, // Caribbean
  'MAHAKALI':         { lat: 1.25,   lng: 103.82, mmsi: '352001456' }, // Singapore Strait
  'SEALION SPIRIT':   { lat: 13.5,   lng: 115.2,  mmsi: '538003789' }, // South China Sea
  'PACIFIC TRADER':   { lat: -9.1,   lng: 79.4,   mmsi: '564004012' }, // Indian Ocean
  'NORTHERN STAR':    { lat: 56.0,   lng: 4.2,    mmsi: '311005345' }, // North Sea
  'OCEAN PRIDE':      { lat: 29.2,   lng: 126.1,  mmsi: '477006678' }, // East China Sea
  'ATLAS VOYAGER':    { lat: 36.4,   lng: 22.1,   mmsi: '239007901' }, // Ionian Sea
  'MERIDIAN QUEEN':   { lat: 13.1,   lng: 65.3,   mmsi: '636008234' }, // Arabian Sea
};

function vesselIcon(status: Vessel['vesselStatus']) {
  const color = status === 'at_sea' ? '#4f46e6'
    : status === 'in_port' ? '#059669'
    : status === 'in_maintenance' ? '#D97706'
    : '#6B7280';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="32" height="40">
    <path d="M16 2 C16 2 4 18 4 24 C4 31 9.5 36 16 36 C22.5 36 28 31 28 24 C28 18 16 2 16 2Z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="16" cy="23" r="4" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
}

function FitBounds({ vessels }: { vessels: Vessel[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    const positioned = vessels.filter(v => v.latitude != null && v.longitude != null);
    if (positioned.length > 0 && !fitted.current) {
      const bounds = L.latLngBounds(positioned.map(v => [v.latitude!, v.longitude!] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
      fitted.current = true;
    }
  }, [vessels, map]);
  return null;
}

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400';

export function FleetMapPage() {
  const { data: vessels, loading, reload } = useCrmFetch(fetchVessels, []);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [editModal, setEditModal] = useState<Vessel | null>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [mmsi, setMmsi] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const positioned = vessels.filter(v => v.latitude != null && v.longitude != null);
  const unpositioned = vessels.filter(v => v.latitude == null || v.longitude == null);

  const statusLabel: Record<string, string> = {
    at_sea: 'At Sea', in_port: 'In Port', in_maintenance: 'In Maintenance', drydock: 'Drydock',
  };
  const statusColor: Record<string, string> = {
    at_sea: '#4f46e6', in_port: '#059669', in_maintenance: '#D97706', drydock: '#6B7280',
  };

  async function handleSavePosition() {
    if (!editModal) return;
    const latN = parseFloat(lat), lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) { setSaveError('Enter valid coordinates.'); return; }
    if (latN < -90 || latN > 90) { setSaveError('Latitude must be between -90 and 90.'); return; }
    if (lngN < -180 || lngN > 180) { setSaveError('Longitude must be between -180 and 180.'); return; }
    setSaving(true); setSaveError(null);
    try {
      await updateVesselPosition(editModal.id, latN, lngN, mmsi || undefined);
      setEditModal(null);
      reload();
    } catch (e) { setSaveError(String(e)); } finally { setSaving(false); }
  }

  async function handleSeedPositions() {
    setSeeding(true); setSeedMsg(null);
    let count = 0;
    try {
      for (const v of vessels) {
        const demo = DEMO_POSITIONS[v.name.toUpperCase()] ?? DEMO_POSITIONS[v.name];
        if (!demo) continue;
        if (v.latitude != null && v.longitude != null) continue; // skip already positioned
        await updateVesselPosition(v.id, demo.lat, demo.lng, demo.mmsi);
        count++;
      }
      setSeedMsg(`Seeded ${count} vessel position${count !== 1 ? 's' : ''} in CRM.`);
      reload();
    } catch (e) { setSeedMsg(`Error: ${String(e)}`); } finally { setSeeding(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F8FAFC' }}>
      {/* Edit Position Modal */}
      {editModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-sm font-bold text-slate-900">Update Position — {editModal.name}</h2>
              <button onClick={() => { setEditModal(null); setSaveError(null); }}><X size={15} className="text-slate-400" /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {saveError && <div className="flex gap-2 p-3 rounded-xl text-xs text-red-700 bg-red-50"><AlertTriangle size={13} className="mt-0.5 shrink-0" />{saveError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Latitude *</label>
                  <input className={inp} type="number" step="0.0001" min="-90" max="90" value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 1.25" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Longitude *</label>
                  <input className={inp} type="number" step="0.0001" min="-180" max="180" value={lng} onChange={e => setLng(e.target.value)} placeholder="e.g. 103.82" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">MMSI Number</label>
                <input className={inp} value={mmsi} onChange={e => setMmsi(e.target.value)} placeholder="9-digit MMSI e.g. 311000123" />
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8' }}>Tip: Find coordinates on Google Maps by right-clicking a location.</p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t">
              <button onClick={() => { setEditModal(null); setSaveError(null); }} className="px-4 py-2 rounded-xl border text-xs text-slate-600">Cancel</button>
              <button onClick={handleSavePosition} disabled={saving} className="px-4 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5" style={{ background: '#4f46e6' }}>
                {saving && <Loader size={12} className="animate-spin" />}Save to CRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(79,70,230,0.1)', border: '1px solid rgba(79,70,230,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={15} color="#4f46e6" />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#1C1C1E', lineHeight: 1 }}>Fleet Map</h1>
            <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{positioned.length} of {vessels.length} vessels positioned</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {seedMsg && <span style={{ fontSize: 11, color: seedMsg.startsWith('Error') ? '#DC2626' : '#059669', fontWeight: 600 }}>{seedMsg}</span>}
          {unpositioned.length > 0 && (
            <button onClick={handleSeedPositions} disabled={seeding} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ background: 'rgba(79,70,230,0.08)', color: '#4f46e6', border: '1px solid rgba(79,70,230,0.2)' }}>
              {seeding ? <Loader size={13} className="animate-spin" /> : <MapPin size={13} />}
              Seed Demo Positions
            </button>
          )}
          <button onClick={reload} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', color: '#374151' }}>
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 260, background: '#fff', borderRight: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Fleet ({vessels.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center' }}><Loader size={16} className="animate-spin mx-auto text-slate-300" /></div>
            ) : vessels.map(v => {
              const hasPos = v.latitude != null && v.longitude != null;
              const isSelected = selected?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelected(isSelected ? null : v)}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)', background: isSelected ? 'rgba(79,70,230,0.06)' : 'transparent', borderLeft: isSelected ? '3px solid #4f46e6' : '3px solid transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{v.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: hasPos ? `${statusColor[v.vesselStatus ?? 'at_sea']}18` : 'rgba(0,0,0,0.05)', color: hasPos ? statusColor[v.vesselStatus ?? 'at_sea'] : '#9CA3AF', flexShrink: 0, marginLeft: 6 }}>
                      {hasPos ? statusLabel[v.vesselStatus ?? 'at_sea'] : 'No position'}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>IMO {v.imo} · {v.type}</div>
                  {hasPos && <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 2, fontFamily: 'monospace' }}>{v.latitude!.toFixed(4)}, {v.longitude!.toFixed(4)}</div>}
                  <button
                    onClick={e => { e.stopPropagation(); setLat(String(v.latitude ?? '')); setLng(String(v.longitude ?? '')); setMmsi(v.mmsi ?? ''); setSaveError(null); setEditModal(v); }}
                    style={{ marginTop: 5, fontSize: 10, color: '#4f46e6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  >
                    {hasPos ? '✏ Update position' : '+ Set position'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.8)' }}>
              <Loader size={24} className="animate-spin text-indigo-500" />
            </div>
          )}
          <MapContainer
            center={[20, 60]}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds vessels={vessels} />
            {vessels.filter(v => v.latitude != null && v.longitude != null).map(v => (
              <Marker
                key={v.id}
                position={[v.latitude!, v.longitude!]}
                icon={vesselIcon(v.vesselStatus)}
                eventHandlers={{ click: () => setSelected(v) }}
              >
                <Popup>
                  <div style={{ minWidth: 200 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1C1C1E' }}>{v.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', fontSize: 11, color: '#374151' }}>
                      <span style={{ color: '#94A3B8' }}>IMO</span><span>{v.imo}</span>
                      <span style={{ color: '#94A3B8' }}>Type</span><span>{v.type}</span>
                      <span style={{ color: '#94A3B8' }}>Flag</span><span>{v.flag}</span>
                      <span style={{ color: '#94A3B8' }}>Status</span>
                      <span style={{ fontWeight: 600, color: statusColor[v.vesselStatus ?? 'at_sea'] }}>
                        {statusLabel[v.vesselStatus ?? 'at_sea']}
                      </span>
                      {v.mmsi && <><span style={{ color: '#94A3B8' }}>MMSI</span><span style={{ fontFamily: 'monospace' }}>{v.mmsi}</span></>}
                      <span style={{ color: '#94A3B8' }}>Position</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{v.latitude!.toFixed(4)}, {v.longitude!.toFixed(4)}</span>
                    </div>
                    {v.lastPositionUpdate && (
                      <div style={{ marginTop: 6, fontSize: 10, color: '#CBD5E1' }}>
                        Updated {new Date(v.lastPositionUpdate).toLocaleString()}
                      </div>
                    )}
                    <button
                      onClick={() => { setLat(String(v.latitude)); setLng(String(v.longitude)); setMmsi(v.mmsi ?? ''); setSaveError(null); setEditModal(v); }}
                      style={{ marginTop: 8, width: '100%', padding: '5px 0', background: '#4f46e6', color: 'white', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Update Position
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 24, right: 12, zIndex: 1000, background: 'white', borderRadius: 10, padding: '8px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', fontSize: 11 }}>
            {Object.entries(statusColor).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                <span style={{ color: '#374151' }}>{statusLabel[k]}</span>
              </div>
            ))}
          </div>

          {/* No vessels message */}
          {!loading && positioned.length === 0 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', borderRadius: 16, padding: '24px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center' }}>
              <Anchor size={32} style={{ margin: '0 auto 10px', color: '#CBD5E1' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No vessel positions yet</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>Click "Seed Demo Positions" to populate<br />all vessels with sample coordinates.</p>
              <button onClick={handleSeedPositions} disabled={seeding} style={{ padding: '8px 20px', background: '#4f46e6', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {seeding ? 'Seeding…' : 'Seed Demo Positions'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
