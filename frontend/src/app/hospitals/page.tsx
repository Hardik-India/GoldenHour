'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import LiveMap from '@/components/map/LiveMap';
import type { MapMarker } from '@/components/map/LeafletMap';
import { Notice } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { fetchOsmEmergencyResources } from '@/lib/osmEmergency';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { AmbulanceUnit, Hospital } from '@/lib/types';
import { cn, formatKm } from '@/lib/utils';

export default function HospitalsPage() {
  const { coords } = useGeolocation();
  const [rawHospitals, setRawHospitals] = useState<Hospital[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>([]);
  const [filters, setFilters] = useState({ trauma: false, icu: false, bloodBank: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function loadResources() {
      if (!coords) return;
      setLoading(true);
      setError('');

      let dbHospitals: Hospital[] = [];
      let dbAmbulances: AmbulanceUnit[] = [];

      try {
        const [hRes, aRes] = await Promise.all([
          api.get('/hospitals/nearby', { params: { lat: coords.lat, lng: coords.lng } }),
          api.get('/ambulances/nearby', { params: { lat: coords.lat, lng: coords.lng } }),
        ]);
        dbHospitals = hRes.data?.items || [];
        dbAmbulances = aRes.data?.items || [];
      } catch {
        /* Fallback to OpenStreetMap below */
      }

      if (dbHospitals.length === 0 || dbAmbulances.length === 0) {
        try {
          const osm = await fetchOsmEmergencyResources(coords.lat, coords.lng, 10000);
          if (dbHospitals.length === 0) dbHospitals = osm.hospitals;
          if (dbAmbulances.length === 0) dbAmbulances = osm.ambulances;
        } catch {
          if (!cancelled && dbHospitals.length === 0) {
            setError('Could not load live map facilities. Check your network connection.');
          }
        }
      }

      if (!cancelled) {
        setRawHospitals(dbHospitals);
        setAmbulances(dbAmbulances);
        setLoading(false);
      }
    }

    loadResources();
    return () => {
      cancelled = true;
    };
  }, [coords]);

  const hospitals = useMemo(() => {
    return rawHospitals.filter((h) => {
      if (filters.trauma && (!h.traumaLevel || h.traumaLevel === 'none')) {
        return false;
      }
      if (filters.icu && !h.hasICU) return false;
      if (filters.bloodBank && !h.hasBloodBank) return false;
      return true;
    });
  }, [rawHospitals, filters]);

  const markers: MapMarker[] = useMemo(() => {
    const list: MapMarker[] = [];
    if (coords) list.push({ id: 'me', lat: coords.lat, lng: coords.lng, kind: 'me', label: 'You' });
    hospitals.forEach((h) =>
      list.push({
        id: h.id,
        lat: h.location.coordinates[1],
        lng: h.location.coordinates[0],
        kind: 'hospital',
        label: h.name,
      })
    );
    ambulances.forEach((a) =>
      list.push({
        id: a.id,
        lat: a.location.coordinates[1],
        lng: a.location.coordinates[0],
        kind: 'ambulance',
        label: `${a.vehicleNumber} (${a.status})`,
      })
    );
    return list;
  }, [coords, hospitals, ambulances]);

  return (
    <AppShell requireAuth={false}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold">Hospitals and ambulances near you</h1>
          <span className="text-xs text-teal">
            {loading
              ? 'Scanning map for nearby medical units...'
              : `${hospitals.length} hospitals · ${ambulances.length} ambulances`}
          </span>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <div className="flex flex-wrap gap-2">
          {([['trauma', 'Trauma care'], ['icu', 'ICU'], ['bloodBank', 'Blood bank']] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setFilters((f) => ({ ...f, [k]: !f[k] }))}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition',
                filters[k] ? 'border-gold bg-gold/15 text-gold' : 'border-white/15 text-white/60 hover:border-white/30'
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {coords ? (
          <LiveMap center={[coords.lat, coords.lng]} zoom={13} markers={markers} className="h-[380px] w-full rounded-3xl" />
        ) : (
          <div className="grid h-[380px] place-items-center rounded-3xl bg-night-900 text-sm text-white/40">
            Acquiring GPS location...
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-semibold">Hospitals ({hospitals.length})</h2>
            {!loading && hospitals.length === 0 && (
              <p className="text-sm text-white/40">No hospitals match the selected filters within range.</p>
            )}
            {hospitals.map((h) => {
              const [hLng, hLat] = h.location.coordinates;
              return (
                <div key={h.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{h.name}</div>
                      <div className="text-xs text-white/50">{h.address}</div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-teal">{formatKm(h.distanceKm)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 capitalize">Trauma: {h.traumaLevel}</span>
                    {h.hasICU && <span className="rounded-full bg-white/10 px-2.5 py-1">ICU ({h.beds?.icu ?? 4} beds)</span>}
                    {h.hasBloodBank && <span className="rounded-full bg-alert/15 px-2.5 py-1 text-alert-soft">Blood bank</span>}
                    {h.open24x7 && <span className="rounded-full bg-teal/15 px-2.5 py-1 text-teal">24x7</span>}
                  </div>
                  {h.hasBloodBank && h.bloodStock && Object.keys(h.bloodStock).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                      {(Object.entries(h.bloodStock) as [string, number][]).map(([g, n]) => (
                        <span
                          key={g}
                          className={cn(
                            'rounded-md px-2 py-0.5',
                            n === 0 ? 'bg-white/5 text-white/30' : n < 3 ? 'bg-gold/15 text-gold' : 'bg-teal/15 text-teal'
                          )}
                        >
                          {g}: {n}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    {h.phone && (
                      <a href={`tel:${h.phone}`} className="text-gold hover:underline">
                        {h.phone}
                      </a>
                    )}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hLat},${hLng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-teal hover:underline"
                    >
                      Navigate →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold">Ambulances ({ambulances.length})</h2>
            {!loading && ambulances.length === 0 && (
              <p className="text-sm text-white/40">No ambulances nearby. Call 108.</p>
            )}
            {ambulances.map((a) => (
              <div key={a.id} className="glass flex items-center justify-between rounded-2xl p-4">
                <div>
                  <div className="font-semibold">
                    {a.vehicleNumber} <span className="text-xs text-white/45">({a.type})</span>
                  </div>
                  <div className="text-xs text-white/50">{a.operator}</div>
                </div>
                <div className="text-right text-sm">
                  <div className={a.status === 'available' ? 'font-medium text-teal' : 'font-medium text-gold'}>
                    {a.status}
                  </div>
                  <div className="text-xs text-white/50">
                    {formatKm(a.distanceKm)} · ~{a.etaMinutes} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}