'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity, AlertTriangle, Check, Droplets, Flame, HeartPulse, MapPin,
  Mic, MicOff, Phone, Radio, Share2, ShieldAlert, Siren, Volume2, VolumeX,
} from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { fetchOsmEmergencyResources } from '@/lib/osmEmergency';
import { useGeolocation } from '@/hooks/useGeolocation';
import { AMBULANCE_NUMBER, cn, EMERGENCY_NUMBER } from '@/lib/utils';
import LiveMap from '@/components/map/LiveMap';
import type { MapMarker } from '@/components/map/LeafletMap';

type Answer = boolean | undefined;

const presets = [
  { id: 'road_accident', label: 'Road Crash', icon: Siren, tone: 'border-alert/35 text-alert-soft' },
  { id: 'cardiac', label: 'Cardiac / Collapse', icon: HeartPulse, tone: 'border-alert/35 text-alert-soft' },
  { id: 'bleeding', label: 'Heavy Bleeding', icon: Droplets, tone: 'border-alert/35 text-alert-soft' },
  { id: 'snakebite', label: 'Snakebite', icon: AlertTriangle, tone: 'border-gold/35 text-gold' },
  { id: 'burn', label: 'Fire / Burn', icon: Flame, tone: 'border-gold/35 text-gold' },
  { id: 'drowning', label: 'Drowning', icon: Activity, tone: 'border-teal/35 text-teal' },
];

const helplines = [
  { num: EMERGENCY_NUMBER, label: 'National Emergency' },
  { num: AMBULANCE_NUMBER, label: 'Ambulance' },
  { num: '101', label: 'Fire Brigade' },
  { num: '100', label: 'Police' },
  { num: '1091', label: 'Women Helpline' },
  { num: '1098', label: 'Childline' },
];

function YesNo({ label, value, onChange }: { label: string; value: Answer; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
      <span className="text-white/85">{label}</span>
      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-semibold transition',
              value === v ? 'bg-gold text-night shadow-glow-gold' : 'bg-white/10 text-white/70 hover:bg-white/15'
            )}
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
  const [listening, setListening] = useState(false);
  const [beaconOn, setBeaconOn] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [nearbyMarkers, setNearbyMarkers] = useState<MapMarker[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const [medId, setMedId] = useState({ bloodGroup: 'O+', allergies: 'None', contactName: 'Family Contact', contactPhone: '' });
  const [editingMed, setEditingMed] = useState(false);
  const audioRef = useRef<{ osc: OscillatorNode; ctx: AudioContext } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gh_medical_id');
      if (saved) setMedId(JSON.parse(saved));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;

    async function loadNearbyHospitals() {
      if (!coords) return;
      setLoadingHospitals(true);
      try {
        const { data } = await api.get('/hospitals/nearby', { params: { lat: coords.lat, lng: coords.lng } });
        let items: { id: string; name: string; location: { coordinates: [number, number] } }[] = data?.items || [];

        if (items.length === 0) {
          const osm = await fetchOsmEmergencyResources(coords.lat, coords.lng, 8000);
          items = osm.hospitals;
        }

        if (!cancelled) {
          const list: MapMarker[] = items.slice(0, 8).map((h) => ({
            id: h.id,
            lat: h.location.coordinates[1],
            lng: h.location.coordinates[0],
            kind: 'hospital' as const,
            label: h.name,
          }));
          setNearbyMarkers(list);
        }
      } catch {
        try {
          const osm = await fetchOsmEmergencyResources(coords.lat, coords.lng, 8000);
          if (!cancelled) {
            setNearbyMarkers(
              osm.hospitals.slice(0, 8).map((h) => ({
                id: h.id,
                lat: h.location.coordinates[1],
                lng: h.location.coordinates[0],
                kind: 'hospital' as const,
                label: h.name,
              }))
            );
          }
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setLoadingHospitals(false);
      }
    }

    loadNearbyHospitals();
    return () => {
      cancelled = true;
    };
  }, [coords]);

  // Audible + visual strobe beacon for dark highway / night visibility
  useEffect(() => {
    if (!beaconOn) {
      if (audioRef.current) {
        try {
          audioRef.current.osc.stop();
          audioRef.current.ctx.close();
        } catch {
          /* ignore */
        }
        audioRef.current = null;
      }
      return;
    }
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 1180;
      gain.gain.value = 0.16;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audioRef.current = { osc, ctx };
      const pulse = setInterval(() => {
        osc.frequency.setValueAtTime(osc.frequency.value > 1000 ? 780 : 1180, ctx.currentTime);
      }, 420);
      return () => {
        clearInterval(pulse);
        try {
          osc.stop();
          ctx.close();
        } catch {
          /* ignore */
        }
      };
    } catch {
      return undefined;
    }
  }, [beaconOn]);

  const severity =
    breathing === false || conscious === false || severeBleeding === true || type === 'cardiac'
      ? {
          level: 'CRITICAL',
          color: 'bg-alert/20 text-alert-soft border-alert/40',
          action: 'Auto-dispatches ALS Ambulance + nearest CPR/Trauma responders. Start guided first aid immediately.',
        }
      : canMove === false || type === 'road_accident' || type === 'snakebite'
      ? {
          level: 'HIGH',
          color: 'bg-gold/20 text-gold border-gold/40',
          action: 'Keep the casualty still and calm. Nearest verified responders & trauma hospital will be alerted.',
        }
      : {
          level: 'MODERATE',
          color: 'bg-teal/20 text-teal border-teal/40',
          action: 'Nearby verified first-aid volunteers will respond and coordinate safe transport.',
        };

  function saveMedId() {
    try {
      localStorage.setItem('gh_medical_id', JSON.stringify(medId));
    } catch {
      /* ignore */
    }
    setEditingMed(false);
  }

  function dictateNote() {
    type RecCtor = new () => {
      lang: string;
      onresult: (e: { results: { transcript: string }[][] }) => void;
      onend: () => void;
      start: () => void;
    };
    const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setError('Voice dictation is not supported in this browser.');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onresult = (e) => setNote((prev) => `${prev ? prev + ' ' : ''}${e.results[0][0].transcript}`);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  function shareFamilyLocation() {
    if (!coords) return;
    const text = `EMERGENCY SOS! Need urgent help (${type.replace('_', ' ')}). Live GPS: https://maps.google.com/?q=${coords.lat.toFixed(5)},${coords.lng.toFixed(5)} | Blood Group: ${medId.bloodGroup}`;
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
    if (medId.contactPhone) {
      window.open(`https://wa.me/${medId.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  async function send(skipTriage = false) {
    if (!coords) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/incidents', {
        lat: coords.lat,
        lng: coords.lng,
        type,
        description: note || undefined,
        triage: skipTriage ? { conscious: false, breathing: false } : { conscious, breathing, severeBleeding, canMove },
      });
      router.push(`/incident/${data.incident._id || data.incident.id}`);
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  }

  const mapMarkers: MapMarker[] = coords
    ? [{ id: 'me', lat: coords.lat, lng: coords.lng, kind: 'sos', label: 'Your SOS Location' }, ...nearbyMarkers]
    : [];

  return (
    <AppShell>
      {beaconOn && <div className="animate-strobe pointer-events-none fixed inset-0 z-50 opacity-30" />}

      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-alert-soft">Emergency Dispatch Console</span>
            <h1 className="mt-1 text-3xl font-bold">GoldenHour SOS</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-medium text-teal">
            <Radio size={14} className="animate-pulse" />
            {coords ? `GPS Active · ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Acquiring GPS...'}
          </div>
        </div>

        <EmergencyBanner />

        {/* Full-Width 2-Column Command Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* LEFT: Rapid SOS Core + Presets + Smart Triage */}
          <div className="space-y-6">
            {!open ? (
              <div className="glass-strong relative overflow-hidden rounded-[2rem] border border-alert/25 p-7 text-center shadow-2xl">
                <div className="flex flex-col items-center py-5">
                  <button
                    onClick={() => setOpen(true)}
                    className="relative grid h-52 w-52 place-items-center rounded-full bg-red-btn text-4xl font-bold italic shadow-glow-red transition hover:scale-105 active:scale-95"
                    aria-label="Raise SOS"
                  >
                    {[0, 0.8, 1.6].map((d) => (
                      <span key={d} className="absolute inset-0 animate-ripple rounded-full border-2 border-alert" style={{ animationDelay: `${d}s` }} />
                    ))}
                    SOS
                  </button>
                  <p className="mt-6 max-w-md text-sm text-white/65">
                    Tap for guided 15-second triage, or trigger an instant critical alert to dispatch help immediately.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button onClick={() => send(true)} disabled={busy || !coords}>
                      <ShieldAlert size={16} /> Instant Critical SOS
                    </Button>
                    <Button variant="glass" onClick={() => setBeaconOn((b) => !b)}>
                      {beaconOn ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      {beaconOn ? 'Stop Night Beacon' : 'Night Siren & Strobe'}
                    </Button>
                  </div>
                </div>

                {/* One-Tap Emergency Presets */}
                <div className="mt-4 border-t border-white/10 pt-6 text-left">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
                    Quick-Start by Emergency Type
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setType(p.id);
                          setOpen(true);
                        }}
                        className={cn(
                          'flex items-center gap-2.5 rounded-2xl border bg-white/[0.03] px-3.5 py-3 text-left text-xs font-semibold transition hover:-translate-y-0.5 hover:bg-white/10',
                          p.tone
                        )}
                      >
                        <p.icon size={17} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-strong space-y-4 rounded-[2rem] border border-alert/30 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-semibold">Smart 15-Second Triage</h2>
                    <p className="text-xs text-white/55">Skip anything unknown. Priority updates automatically.</p>
                  </div>
                  <span className={cn('rounded-full border px-3.5 py-1 text-xs font-bold', severity.color)}>
                    {severity.level} PRIORITY
                  </span>
                </div>

                <div className="rounded-2xl border border-gold/25 bg-gold/10 px-4 py-2.5 text-xs text-gold-soft">
                  {severity.action}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setType(p.id)}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-xs font-medium transition',
                        type === p.id ? 'border-gold bg-gold/15 text-gold' : 'border-white/10 bg-white/5 text-white/65'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <YesNo label="Is the person awake and responding?" value={conscious} onChange={setConscious} />
                <YesNo label="Are they breathing normally?" value={breathing} onChange={setBreathing} />
                <YesNo label="Is there heavy bleeding?" value={severeBleeding} onChange={setSevereBleeding} />
                <YesNo label="Can they move on their own?" value={canMove} onChange={setCanMove} />

                <div>
                  <label className="label">Landmark / voice note (optional)</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Near petrol pump, metro pillar 42..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={dictateNote}
                      className={cn(
                        'grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition',
                        listening ? 'animate-pulse border-alert bg-alert/20 text-alert' : 'border-white/15 bg-white/5 text-gold hover:bg-white/10'
                      )}
                      aria-label="Dictate landmark"
                    >
                      {listening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/55">
                  <MapPin size={14} className="text-gold" />
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}${coords.accurate ? '' : ' (demo GPS)'}` : 'Getting location...'}
                  <button className="ml-auto text-gold underline" onClick={locate}>
                    Refresh GPS
                  </button>
                </div>

                {geoError && <Notice tone="warn">{geoError}. Using regional center.</Notice>}
                {error && <Notice tone="error">{error}</Notice>}

                <div className="flex gap-3 pt-1">
                  <Button className="flex-1 py-3.5" onClick={() => send(false)} disabled={busy || !coords}>
                    {busy ? 'Dispatching Mesh...' : 'Send SOS Now'}
                  </Button>
                  <Button variant="glass" onClick={() => setOpen(false)}>
                    Back
                  </Button>
                </div>
              </div>
            )}

            {/* Pre-Arrival First-Aid Shortcuts */}
            <div className="glass rounded-3xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">While help is on the way</h3>
                <Link href="/first-aid" className="text-xs text-gold hover:underline">
                  All protocols →
                </Link>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-3">
                <Link href="/first-aid/cpr-adult" className="rounded-2xl border border-alert/25 bg-alert/10 p-3 text-xs font-semibold text-alert-soft transition hover:bg-alert/20">
                  ♥ Start 110 BPM CPR
                </Link>
                <Link href="/first-aid/severe-bleeding" className="rounded-2xl border border-gold/25 bg-gold/10 p-3 text-xs font-semibold text-gold transition hover:bg-gold/20">
                  ● Stop Heavy Bleeding
                </Link>
                <Link href="/first-aid/road-accident-first-aid" className="rounded-2xl border border-teal/25 bg-teal/10 p-3 text-xs font-semibold text-teal transition hover:bg-teal/20">
                  ▲ Crash Scene Safety
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Tactical Map + Emergency Medical ID + Helplines */}
          <div className="space-y-6">
            <div className="glass-strong overflow-hidden rounded-[2rem] p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="text-sm font-semibold">Live Situational Map</div>
                <span className="text-xs text-teal">
                  {loadingHospitals ? 'Scanning nearby...' : `● ${nearbyMarkers.length} nearby hospitals`}
                </span>
              </div>
              {coords ? (
                <LiveMap center={[coords.lat, coords.lng]} zoom={14} markers={mapMarkers} className="h-[300px] w-full rounded-2xl" />
              ) : (
                <div className="grid h-[300px] place-items-center rounded-2xl bg-night-900 text-sm text-white/40">Locating...</div>
              )}
            </div>

            {/* Emergency Medical ID + Family GPS Share */}
            <div className="glass rounded-3xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Emergency Medical ID</h3>
                <button onClick={() => setEditingMed((e) => !e)} className="text-xs text-gold underline">
                  {editingMed ? 'Cancel' : 'Edit ID'}
                </button>
              </div>
              {editingMed ? (
                <div className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input py-2" placeholder="Blood Group (O+)" value={medId.bloodGroup} onChange={(e) => setMedId({ ...medId, bloodGroup: e.target.value })} />
                    <input className="input py-2" placeholder="Allergies" value={medId.allergies} onChange={(e) => setMedId({ ...medId, allergies: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input py-2" placeholder="ICE Contact Name" value={medId.contactName} onChange={(e) => setMedId({ ...medId, contactName: e.target.value })} />
                    <input className="input py-2" placeholder="WhatsApp / Phone" value={medId.contactPhone} onChange={(e) => setMedId({ ...medId, contactPhone: e.target.value })} />
                  </div>
                  <Button variant="gold" className="w-full py-2" onClick={saveMedId}>
                    Save Medical ID
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-alert/15 p-2.5">
                      <div className="text-[10px] uppercase text-white/50">Blood</div>
                      <div className="text-lg font-bold text-alert-soft">{medId.bloodGroup}</div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2.5">
                      <div className="text-[10px] uppercase text-white/50">Allergies</div>
                      <div className="truncate text-xs font-semibold text-white">{medId.allergies || 'None'}</div>
                    </div>
                    <div className="rounded-xl bg-white/5 p-2.5">
                      <div className="text-[10px] uppercase text-white/50">ICE Contact</div>
                      <div className="truncate text-xs font-semibold text-gold">{medId.contactName}</div>
                    </div>
                  </div>
                  <Button variant="glass" className="w-full py-2.5 text-xs" onClick={shareFamilyLocation} disabled={!coords}>
                    {copiedShare ? <Check size={15} className="text-teal" /> : <Share2 size={15} />}
                    {copiedShare ? 'GPS Alert Copied!' : '1-Tap Share Live GPS with Family'}
                  </Button>
                </div>
              )}
            </div>

            {/* India National Helplines */}
            <div className="glass rounded-3xl p-5">
              <h3 className="mb-3 text-sm font-semibold">Direct National Helplines</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {helplines.map((h) => (
                  <a
                    key={h.num}
                    href={`tel:${h.num}`}
                    className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-alert/50 hover:bg-alert/10"
                  >
                    <span className="flex items-center gap-1.5 text-base font-bold text-alert-soft">
                      <Phone size={13} /> {h.num}
                    </span>
                    <span className="text-[11px] text-white/55">{h.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}