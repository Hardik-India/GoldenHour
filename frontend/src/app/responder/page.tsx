'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/store/auth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import type { Incident } from '@/lib/types';
import { formatKm } from '@/lib/utils';

interface Alert {
  incidentId: string;
  type: string;
  severity: string;
  distanceKm: number;
  etaMinutes: number;
}

export default function ResponderPage() {
  const { user, refresh } = useAuth();
  const { coords } = useGeolocation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [active, setActive] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const watchRef = useRef<number | null>(null);

  const rp = user?.responderProfile;

  const loadActive = useCallback(async () => {
    if (!rp?.verified) return;
    try {
      const { data } = await api.get('/incidents/active');
      setActive(data.items);
    } catch (err) {
      setError(apiError(err));
    }
  }, [rp?.verified]);

  useEffect(() => { loadActive(); }, [loadActive]);

  // keep the server copy of my location fresh so I am found by $near queries
  useEffect(() => {
    if (coords && rp?.verified) {
      api.patch('/auth/me', { lat: coords.lat, lng: coords.lng }).catch(() => undefined);
    }
  }, [coords, rp?.verified]);

  useSocketEvent<{ data: Alert }>(
    'incident:new',
    useCallback((p) => setAlerts((a) => [p.data, ...a.filter((x) => x.incidentId !== p.data.incidentId)]), [])
  );

  // Stream live position while I have accepted an incident
  useEffect(() => {
    const accepted = active.filter((i) =>
      i.responders.some((r) => typeof r.user !== 'string' && r.user._id === user?.id && ['accepted', 'arrived'].includes(r.status))
    );
    if (!accepted.length || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        accepted.forEach((i) =>
          getSocket().emit('responder:location', { incidentId: i._id, lat: pos.coords.latitude, lng: pos.coords.longitude })
        );
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 4000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [active, user?.id]);

  async function toggle() {
    setError('');
    try {
      await api.patch('/auth/me', { responderAvailable: !rp?.available });
      await refresh();
    } catch (err) {
      setError(apiError(err));
    }
  }

  async function respond(id: string, action: 'accept' | 'decline') {
    try {
      await api.post(`/incidents/${id}/${action}`);
      setAlerts((a) => a.filter((x) => x.incidentId !== id));
      await loadActive();
    } catch (err) {
      setError(apiError(err));
    }
  }

  return (
    <AppShell roles={['responder', 'admin']}>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">Responder dashboard</h1>

        {!rp?.verified && user?.role !== 'admin' && (
          <Notice tone="warn">Your application is pending verification by an admin. You will start receiving alerts once approved.</Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}

        <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
          <div>
            <div className="text-lg font-semibold">{rp?.available ? 'You are available' : 'You are offline'}</div>
            <p className="text-sm text-white/55">
              {rp?.available ? 'Nearby emergencies will be sent to you instantly.' : 'Switch on to receive alerts within a few km of you.'}
            </p>
            <p className="mt-1 text-xs text-white/40">Incidents handled: {rp?.incidentsHandled ?? 0}</p>
          </div>
          <Button variant={rp?.available ? 'glass' : 'primary'} onClick={toggle} disabled={!rp?.verified && user?.role !== 'admin'}>
            {rp?.available ? 'Go offline' : 'Go available'}
          </Button>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-alert-soft">Incoming alerts</h2>
            {alerts.map((a) => (
              <div key={a.incidentId} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-alert/40 bg-alert/10 p-5 shadow-glow-red">
                <div>
                  <div className="font-semibold capitalize">{a.type.replace('_', ' ')} - {a.severity}</div>
                  <div className="text-sm text-white/60">{formatKm(a.distanceKm)} away - about {a.etaMinutes} min</div>
                </div>
                <div className="flex gap-2">
                  <Button className="px-5 py-2" onClick={() => respond(a.incidentId, 'accept')}>Accept</Button>
                  <Button variant="glass" className="px-5 py-2" onClick={() => respond(a.incidentId, 'decline')}>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <h2 className="mb-3 font-semibold">My active responses</h2>
          {active.length === 0 ? (
            <p className="text-sm text-white/45">Nothing active right now.</p>
          ) : (
            <div className="space-y-3">
              {active.map((i) => (
                <Link key={i._id} href={`/incident/${i._id}`} className="glass block rounded-2xl p-4 hover:border-gold/50">
                  <div className="font-medium capitalize">{i.type.replace('_', ' ')} - {i.severity}</div>
                  <div className="text-xs text-white/50">{i.status.replace('_', ' ')} - tap to open the live map</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
