'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { AMBULANCE_NUMBER, EMERGENCY_NUMBER } from '@/lib/utils';
import LiveMap from '@/components/map/LiveMap';

type Answer = boolean | undefined;

const types = [
  ['road_accident', 'Road accident'],
  ['cardiac', 'Cardiac / collapse'],
  ['bleeding', 'Heavy bleeding'],
  ['drowning', 'Drowning'],
  ['snakebite', 'Snakebite'],
  ['burn', 'Burn'],
  ['other', 'Other'],
];

function YesNo({ label, value, onChange }: { label: string; value: Answer; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
      <span>{label}</span>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${value === v ? 'bg-gold text-night' : 'bg-white/10 text-white/70'}`}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SosPage() {
  const router = useRouter();
  const { coords, error: geoError, locate } = useGeolocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('road_accident');
  const [conscious, setConscious] = useState<Answer>();
  const [breathing, setBreathing] = useState<Answer>();
  const [severeBleeding, setSevereBleeding] = useState<Answer>();
  const [canMove, setCanMove] = useState<Answer>();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    if (!coords) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/incidents', {
        lat: coords.lat,
        lng: coords.lng,
        type,
        description: note || undefined,
        triage: { conscious, breathing, severeBleeding, canMove },
      });
      router.push(`/incident/${data.incident._id || data.incident.id}`);
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <EmergencyBanner />

        <div className="grid gap-3 sm:grid-cols-2">
          <a href={`tel:${EMERGENCY_NUMBER}`} className="glass flex items-center justify-center gap-2 rounded-2xl p-4 font-semibold text-alert-soft">
            <Phone size={18} /> Call {EMERGENCY_NUMBER}
          </a>
          <a href={`tel:${AMBULANCE_NUMBER}`} className="glass flex items-center justify-center gap-2 rounded-2xl p-4 font-semibold text-alert-soft">
            <Phone size={18} /> Ambulance {AMBULANCE_NUMBER}
          </a>
        </div>

        {!open ? (
          <div className="flex flex-col items-center py-8">
            <button
              onClick={() => setOpen(true)}
              className="relative grid h-56 w-56 place-items-center rounded-full bg-red-btn text-4xl font-bold italic shadow-glow-red transition active:scale-95"
              aria-label="Raise SOS"
            >
              {[0, 0.8, 1.6].map((d) => (
                <span key={d} className="absolute inset-0 animate-ripple rounded-full border-2 border-alert" style={{ animationDelay: `${d}s` }} />
              ))}
              SOS
            </button>
            <p className="mt-6 text-white/60">Tap to alert verified responders, ambulance and hospital near you.</p>
          </div>
        ) : (
          <div className="glass-strong space-y-4 rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Quick questions (15 seconds)</h2>
            <p className="text-sm text-white/55">Skip anything you do not know. Do not delay calling 112 / 108.</p>

            <div>
              <label className="label">What happened?</label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                {types.map(([v, l]) => <option key={v} value={v} className="bg-night">{l}</option>)}
              </select>
            </div>
            <YesNo label="Is the person awake and responding?" value={conscious} onChange={setConscious} />
            <YesNo label="Are they breathing normally?" value={breathing} onChange={setBreathing} />
            <YesNo label="Is there heavy bleeding?" value={severeBleeding} onChange={setSevereBleeding} />
            <YesNo label="Can they move on their own?" value={canMove} onChange={setCanMove} />
            <div>
              <label className="label">Landmark / note (optional)</label>
              <input className="input" placeholder="Near the petrol pump, blue car..." value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 text-xs text-white/50">
              <MapPin size={14} />
              {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}${coords.accurate ? '' : ' (demo location)'}` : 'Getting location...'}
              <button className="ml-auto text-gold underline" onClick={locate}>Refresh</button>
            </div>
            {geoError && <Notice tone="warn">{geoError}. Using the demo location.</Notice>}
            {error && <Notice tone="error">{error}</Notice>}

            <div className="flex gap-3">
              <Button className="flex-1" onClick={send} disabled={busy || !coords}>{busy ? 'Alerting...' : 'Send SOS now'}</Button>
              <Button variant="glass" onClick={() => setOpen(false)}>Back</Button>
            </div>
          </div>
        )}

        {coords && (
          <LiveMap
            center={[coords.lat, coords.lng]}
            zoom={15}
            markers={[{ id: 'me', lat: coords.lat, lng: coords.lng, kind: 'me', label: 'You are here' }]}
            className="h-[300px] w-full rounded-3xl"
          />
        )}
      </div>
    </AppShell>
  );
}
