'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/app/AppShell';
import LiveMap from '@/components/map/LiveMap';
import type { MapMarker } from '@/components/map/LeafletMap';
import { Button } from '@/components/ui/Button';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { api, apiError } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/store/auth';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import type { Incident } from '@/lib/types';
import { Notice } from '@/components/ui/Toast';
import { formatKm, timeAgo } from '@/lib/utils';

const statusLabel: Record<string, string> = {
  open: 'Alerting responders',
  responder_assigned: 'Help is on the way',
  on_scene: 'Responder on scene',
  resolved: 'Resolved',
  cancelled: 'Cancelled',
};

export default function IncidentPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuth((s) => s.user);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [live, setLive] = useState<Record<string, { lat: number; lng: number }>>({});
  const [ambulancePos, setAmbulancePos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/incidents/${id}`);
      setIncident(data.incident);
    } catch (err) {
      setError(apiError(err));
    }
  }, [id]);

  useEffect(() => {
    load();
    const poll = setInterval(load, 10000); // backup in case a socket event is missed
    const s = getSocket();
    s.emit('incident:join', id);
    return () => {
      clearInterval(poll);
      s.emit('incident:leave', id);
    };
  }, [id, load]);

  useSocketEvent('incident:update', useCallback(() => { load(); }, [load]));
  useSocketEvent<{ userId: string; lat: number; lng: number }>(
    'responder:location',
    useCallback((p) => setLive((prev) => ({ ...prev, [p.userId]: { lat: p.lat, lng: p.lng } })), [])
  );
  useSocketEvent<{ lat: number; lng: number }>(
    'ambulance:location',
    useCallback((p) => setAmbulancePos({ lat: p.lat, lng: p.lng }), [])
  );

  const [sosLng, sosLat] = incident?.location.coordinates ?? [0, 0];
  const accepted = useMemo(
    () => incident?.responders.filter((r) => ['accepted', 'arrived'].includes(r.status)) ?? [],
    [incident]
  );

  const markers: MapMarker[] = useMemo(() => {
    if (!incident) return [];
    const list: MapMarker[] = [{ id: 'sos', lat: sosLat, lng: sosLng, kind: 'sos', label: 'Emergency' }];
    for (const r of accepted) {
      const u = typeof r.user === 'string' ? null : r.user;
      if (!u) continue;
      const pos = live[u._id] || (u.location ? { lat: u.location.coordinates[1], lng: u.location.coordinates[0] } : null);
      if (pos) list.push({ id: u._id, ...pos, kind: 'responder', label: `${u.name} - ETA ${r.etaMinutes} min` });
    }
    const amb = incident.ambulance;
    if (amb) {
      const pos = ambulancePos || { lat: amb.location.coordinates[1], lng: amb.location.coordinates[0] };
      list.push({ id: 'amb', ...pos, kind: 'ambulance', label: `Ambulance ${amb.vehicleNumber}` });
    }
    if (incident.hospital) {
      list.push({
        id: 'hos',
        lat: incident.hospital.location.coordinates[1],
        lng: incident.hospital.location.coordinates[0],
        kind: 'hospital',
        label: incident.hospital.name,
      });
    }
    return list;
  }, [incident, accepted, live, ambulancePos, sosLat, sosLng]);

  async function act(path: string) {
    try {
      await api.post(`/incidents/${id}/${path}`);
      await load();
    } catch (err) {
      setError(apiError(err));
    }
  }

  if (!incident) {
    return <AppShell><div className="text-white/50">{error || 'Loading incident...'}</div></AppShell>;
  }

  const closed = ['resolved', 'cancelled'].includes(incident.status);
  const isReporter = incident.reporter?._id === user?.id;
  const myEntry = incident.responders.find((r) => typeof r.user !== 'string' && r.user._id === user?.id);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <EmergencyBanner />
          <LiveMap center={[sosLat, sosLng]} zoom={15} markers={markers} className="h-[460px] w-full rounded-3xl" />
          <div className="flex flex-wrap gap-4 text-xs text-white/60">
            <span><b className="text-alert">●</b> Emergency</span>
            <span><b className="text-gold">●</b> Responder</span>
            <span><b className="text-white">●</b> Ambulance</span>
            <span><b className="text-teal">●</b> Hospital</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{statusLabel[incident.status]}</h1>
              <span className="rounded-full bg-alert/20 px-3 py-1 text-xs font-semibold uppercase text-alert-soft">
                {incident.severity}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/55">{incident.type.replace('_', ' ')} - raised {timeAgo(incident.createdAt)}</p>

            {incident.ambulance && (
              <div className="mt-4 rounded-2xl border border-white/10 p-3 text-sm">
                Ambulance <b>{incident.ambulance.vehicleNumber}</b> ({incident.ambulance.type}) - {incident.ambulance.status}
              </div>
            )}
            {incident.hospital && (
              <div className="mt-3 rounded-2xl border border-teal/30 p-3 text-sm">
                Suggested hospital: <b>{incident.hospital.name}</b>
                {incident.hospital.phone && <> - <a className="text-teal" href={`tel:${incident.hospital.phone}`}>{incident.hospital.phone}</a></>}
              </div>
            )}

            <h3 className="mb-2 mt-5 text-sm font-semibold text-white/70">Responders ({accepted.length} on the way)</h3>
            <ul className="space-y-2 text-sm">
              {incident.responders.length === 0 && <li className="text-white/40">No responders in range. Keep calling 112 / 108.</li>}
              {incident.responders.map((r, i) => {
                const u = typeof r.user === 'string' ? null : r.user;
                return (
                  <li key={i} className="flex justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span>{u?.name ?? 'Responder'}</span>
                    <span className="text-white/50">{r.status} - {formatKm(r.distanceKm)} - ~{r.etaMinutes} min</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button href="/first-aid/cpr-adult" variant="gold" className="px-4 py-2">Guided CPR</Button>
              <Button href="/first-aid/severe-bleeding" variant="gold" className="px-4 py-2">Bleeding</Button>
            </div>

            {!closed && (
              <div className="mt-5 flex flex-wrap gap-2">
                {myEntry && myEntry.status === 'notified' && <Button className="px-4 py-2" onClick={() => act('accept')}>Accept</Button>}
                {myEntry && myEntry.status === 'accepted' && <Button variant="teal" className="px-4 py-2" onClick={() => act('arrive')}>I have arrived</Button>}
                {(isReporter || myEntry) && <Button variant="glass" className="px-4 py-2" onClick={() => act('resolve')}>Mark resolved</Button>}
                {isReporter && <Button variant="ghost" className="px-4 py-2" onClick={() => act('cancel')}>Cancel (false alarm)</Button>}
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="mb-3 font-semibold">Timeline</h3>
            <ol className="space-y-3 border-l border-white/10 pl-4 text-sm">
              {incident.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-gold" />
                  <div>{t.event}</div>
                  <div className="text-xs text-white/40">{new Date(t.at).toLocaleTimeString()}</div>
                </li>
              ))}
            </ol>
          </div>

          {error && <Notice tone="error">{error}</Notice>}
          <Link href="/sos" className="block text-center text-sm text-white/50 hover:text-white">Back to SOS</Link>
        </div>
      </div>
    </AppShell>
  );
}
