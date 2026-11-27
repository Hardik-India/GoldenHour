'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Droplets, Pause, Play, RotateCcw, Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

type ScenarioId = 'road' | 'cardiac' | 'blood';

interface Scenario {
  id: ScenarioId;
  label: string;
  badge: string;
  icon: React.ElementType;
  locationLabel: string;
  callerGuide: string;
  responders: { name: string; role: string; start: { x: number; y: number }; accept: number; arrive: number }[];
  unit: { label: string; start: { x: number; y: number }; dispatch: number; arrive: number };
  events: { at: number; text: string; tone: string }[];
}

const CENTER = { x: 310, y: 205 };

const SCENARIOS: Record<ScenarioId, Scenario> = {
  road: {
    id: 'road',
    label: 'Highway Crash',
    badge: 'Trauma · Critical',
    icon: Siren,
    locationLabel: 'EM Bypass · Sector V Flyover',
    callerGuide: 'Apply firm steady pressure with clean cloth. Do not remove the rider helmet.',
    responders: [
      { name: 'Aarav', role: 'EMT Vol.', start: { x: 85, y: 65 }, accept: 2.5, arrive: 10.5 },
      { name: 'Diya', role: 'First Aid', start: { x: 525, y: 88 }, accept: 3.8, arrive: 12.5 },
      { name: 'Rohan', role: 'Nurse', start: { x: 510, y: 335 }, accept: 5.0, arrive: 14.5 },
      { name: 'Meera', role: 'Busy', start: { x: 75, y: 330 }, accept: 99, arrive: 99 },
    ],
    unit: { label: 'ALS-108', start: { x: 35, y: 205 }, dispatch: 5.5, arrive: 16.5 },
    events: [
      { at: 0.0, text: 'One-tap SOS raised · GPS locked (±8m)', tone: 'text-alert-soft' },
      { at: 1.0, text: '4 verified responders pinged within 2.5 km', tone: 'text-gold' },
      { at: 2.5, text: 'Aarav (EMT Vol.) accepted · ETA 2 min', tone: 'text-teal' },
      { at: 3.8, text: 'Diya accepted · Trauma kit onboard', tone: 'text-teal' },
      { at: 5.5, text: 'ALS Ambulance 108 dispatched · Trauma L1 notified', tone: 'text-gold' },
      { at: 7.0, text: 'Bleeding-control voice coach active on caller phone', tone: 'text-white/85' },
      { at: 10.5, text: 'Aarav arrived on scene · Bleeding stabilised', tone: 'text-teal' },
      { at: 16.5, text: 'Ambulance handoff complete · Golden Hour preserved', tone: 'text-teal' },
    ],
  },
  cardiac: {
    id: 'cardiac',
    label: 'Metro Cardiac Arrest',
    badge: 'Cardiac · 110 BPM CPR',
    icon: Activity,
    locationLabel: 'Park Street Metro · Gate 2',
    callerGuide: 'CPR Metronome Active: Push hard & fast at 110 BPM (centre of chest).',
    responders: [
      { name: 'Dr. Sen', role: 'Cardio Res.', start: { x: 110, y: 85 }, accept: 2.0, arrive: 9.0 },
      { name: 'Kabir', role: 'AED Runner', start: { x: 500, y: 75 }, accept: 3.2, arrive: 11.5 },
      { name: 'Ananya', role: 'BLS Cert.', start: { x: 485, y: 325 }, accept: 4.5, arrive: 13.5 },
    ],
    unit: { label: 'ICCU-Amb', start: { x: 560, y: 210 }, dispatch: 4.8, arrive: 16.0 },
    events: [
      { at: 0.0, text: 'Unresponsive collapse reported · Critical Cardiac Triage', tone: 'text-alert-soft' },
      { at: 1.2, text: 'Caller phone launches 110 BPM Hands-Only CPR Coach', tone: 'text-gold' },
      { at: 2.0, text: 'Dr. Sen accepted (450m away) · ETA 1.5 min', tone: 'text-teal' },
      { at: 3.2, text: 'Kabir dispatched with station AED defibrillator', tone: 'text-gold' },
      { at: 4.8, text: 'Cardiac ICCU Ambulance en route · Cath Lab alerted', tone: 'text-gold' },
      { at: 9.0, text: 'Dr. Sen on scene · Continuous compressions maintained', tone: 'text-teal' },
      { at: 11.5, text: 'AED shock delivered · Pulse restored', tone: 'text-teal' },
      { at: 16.0, text: 'ICCU ambulance transport underway', tone: 'text-teal' },
    ],
  },
  blood: {
    id: 'blood',
    label: 'Rare O- Blood Link',
    badge: 'Blood SOS · 2 Units',
    icon: Droplets,
    locationLabel: 'Medical College Maternity Ward',
    callerGuide: 'Compatible O- donors & verified blood banks alerted automatically.',
    responders: [
      { name: 'Suman (O-)', role: 'Eligible', start: { x: 100, y: 310 }, accept: 2.8, arrive: 11.0 },
      { name: 'Priya (O-)', role: 'Eligible', start: { x: 520, y: 110 }, accept: 4.0, arrive: 13.0 },
      { name: 'Arjun (O-)', role: 'Eligible', start: { x: 160, y: 60 }, accept: 6.2, arrive: 15.0 },
    ],
    unit: { label: 'Blood Van', start: { x: 45, y: 150 }, dispatch: 5.0, arrive: 16.2 },
    events: [
      { at: 0.0, text: 'Urgent 2 units O- requested · Maternity emergency', tone: 'text-alert-soft' },
      { at: 1.2, text: 'Compatibility engine scans eligible O- donors (cooldown clear)', tone: 'text-gold' },
      { at: 2.8, text: 'Suman (O-) confirmed · 1.2 km from hospital', tone: 'text-teal' },
      { at: 4.0, text: 'Priya (O-) confirmed · Heading to blood bank', tone: 'text-teal' },
      { at: 5.0, text: 'Backup blood bank unit cross-match reserved', tone: 'text-gold' },
      { at: 11.0, text: 'First donor arrived for screening & donation', tone: 'text-teal' },
      { at: 16.2, text: 'Both O- units fulfilled · Request closed safely', tone: 'text-teal' },
    ],
  },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export function DemoSimulator() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('road');
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const raf = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const scenario = SCENARIOS[scenarioId];

  useEffect(() => {
    if (!running) return;
    lastRef.current = performance.now();
    const loop = (now: number) => {
      const dt = ((now - lastRef.current) / 1000) * speed;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= 18) {
          setRunning(false);
          return 18;
        }
        return next;
      });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running, speed]);

  const switchScenario = (id: ScenarioId) => {
    setScenarioId(id);
    setT(0);
    setRunning(true);
  };

  const started = t > 0 || running;
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(Math.floor(t % 60)).padStart(2, '0');
  const unitP = (t - scenario.unit.dispatch) / (scenario.unit.arrive - scenario.unit.dispatch);
  const unitX = lerp(scenario.unit.start.x, CENTER.x, unitP);
  const unitY = lerp(scenario.unit.start.y, CENTER.y, unitP);
  const progressPct = Math.round((t / 18) * 100);
  const acceptedCount = scenario.responders.filter((r) => t >= r.accept).length;

  return (
    <section id="demo" className="container-x py-24">
      <SectionHeading
        eyebrow="Interactive Command Demo"
        title={<>Watch a rescue <span className="text-gold-gradient">unfold live</span></>}
        sub="Switch between real Indian emergencies to see alerts, responders, blood donors, and ambulances converge."
      />

      {/* Scenario Switcher */}
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {(Object.values(SCENARIOS) as Scenario[]).map((sc) => (
          <button
            key={sc.id}
            onClick={() => switchScenario(sc.id)}
            className={cn(
              'flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium transition',
              scenarioId === sc.id
                ? 'border-gold bg-gold/15 text-gold shadow-glow-gold'
                : 'border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30 hover:text-white'
            )}
          >
            <sc.icon size={16} />
            {sc.label}
          </button>
        ))}
      </div>

      <div className="glass-strong overflow-hidden rounded-[2rem] border border-white/15 p-3 shadow-2xl sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          {/* Tactical SVG Command Map */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#070C18]">
            <svg viewBox="0 0 620 410" className="block w-full">
              <defs>
                <radialGradient id="simGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF3B4E" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF3B4E" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFB938" stopOpacity="0" />
                  <stop offset="100%" stopColor="#FFB938" stopOpacity="0.24" />
                </linearGradient>
              </defs>

              {/* City roads + river */}
              <g stroke="#15223B" strokeWidth="1.4" fill="none">
                {[70, 140, 210, 280, 350].map((y) => <path key={y} d={`M0 ${y}H620`} />)}
                {[90, 180, 270, 360, 450, 540].map((x) => <path key={x} d={`M${x} 0V410`} />)}
                <path d="M0 368 Q 220 305 620 345" stroke="#183A63" strokeWidth="14" opacity="0.55" />
                <path d="M-10 40 L 630 290" stroke="#1D2E4E" strokeWidth="2.5" />
              </g>

              {/* Radar range circles */}
              <circle cx={CENTER.x} cy={CENTER.y} r="175" fill="url(#simGlow)" />
              {[75, 130, 185].map((r) => (
                <circle key={r} cx={CENTER.x} cy={CENTER.y} r={r} fill="none" stroke="#FFB938" strokeOpacity="0.16" strokeDasharray="4 8" />
              ))}

              {/* Rotating radar sweep */}
              {running && (
                <g transform={`translate(${CENTER.x} ${CENTER.y})`}>
                  <g className="animate-radar-sweep">
                    <path d="M0 0 L 185 0 A 185 185 0 0 0 155 -100 Z" fill="url(#sweepGrad)" />
                  </g>
                </g>
              )}

              {/* Responders */}
              {scenario.responders.map((r) => {
                const accepted = t >= r.accept;
                const notified = t >= 1;
                const p = (t - r.accept) / (r.arrive - r.accept);
                const x = accepted ? lerp(r.start.x, CENTER.x, p) : r.start.x;
                const y = accepted ? lerp(r.start.y, CENTER.y, p) : r.start.y;
                const declined = r.accept === 99 && t > 4;
                const arrived = t >= r.arrive;
                return (
                  <g key={r.name} opacity={declined ? 0.3 : 1}>
                    {accepted && (
                      <line
                        x1={r.start.x}
                        y1={r.start.y}
                        x2={CENTER.x}
                        y2={CENTER.y}
                        stroke={arrived ? '#2DD4BF' : '#FFB938'}
                        strokeWidth="2"
                        strokeOpacity="0.65"
                        strokeDasharray="6 6"
                      />
                    )}
                    {notified && !accepted && !declined && (
                      <circle cx={x} cy={y} r="10" fill="none" stroke="#FFB938" strokeWidth="1.5">
                        <animate attributeName="r" values="8;24" dur="1.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={x} cy={y} r="9" fill={arrived ? '#2DD4BF' : accepted ? '#FFB938' : '#64748b'} />
                    <circle cx={x} cy={y} r="3.2" fill="#fff" />
                    <text x={x} y={y - 14} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
                      {r.name}
                    </text>
                  </g>
                );
              })}

              {/* Ambulance / Blood Unit */}
              {t >= scenario.unit.dispatch && (
                <g>
                  <line x1={scenario.unit.start.x} y1={scenario.unit.start.y} x2={CENTER.x} y2={CENTER.y} stroke="#2DD4BF" strokeWidth="2.5" strokeDasharray="4 6" opacity="0.6" />
                  <rect x={unitX - 18} y={unitY - 10} width="36" height="20" rx="5" fill="#fff" />
                  <rect x={unitX - 18} y={unitY - 10} width="36" height="6" rx="3" fill="#FF3B4E" />
                  <text x={unitX} y={unitY + 7} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0B0F1A">+</text>
                  <circle cx={unitX} cy={unitY - 14} r="3.5" fill="#FF3B4E">
                    <animate attributeName="fill" values="#FF3B4E;#3b82f6;#FF3B4E" dur="0.55s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* SOS Core */}
              {started &&
                [0, 0.8, 1.6].map((b) => (
                  <circle key={b} cx={CENTER.x} cy={CENTER.y} r="18" fill="none" stroke="#FF3B4E" strokeWidth="2">
                    <animate attributeName="r" values="18;105" dur="2.4s" begin={`${b}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.85;0" dur="2.4s" begin={`${b}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              <circle cx={CENTER.x} cy={CENTER.y} r="20" fill="#FF3B4E" />
              <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">SOS</text>
            </svg>

            {/* Map Top HUD */}
            <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-alert/40 bg-night-900/85 px-3.5 py-1 text-xs font-bold text-alert-soft backdrop-blur">
                  {mm}:{ss}
                </span>
                <span className="rounded-full border border-white/15 bg-night-900/80 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  {scenario.locationLabel}
                </span>
              </div>
              <span className="rounded-full border border-teal/30 bg-teal/15 px-3 py-1 text-xs font-semibold text-teal backdrop-blur">
                {acceptedCount} Converging
              </span>
            </div>

            {/* Bystander Screen Preview */}
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-gold/25 bg-night-900/90 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gold">
                <span>CALLER PHONE · LIVE PRE-ARRIVAL COACH</span>
                <span>{scenario.badge}</span>
              </div>
              <p className="mt-0.5 text-xs text-white/85">{scenario.callerGuide}</p>
            </div>
          </div>

          {/* Controls + Live Event Feed */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">Live Dispatch Telemetry</h3>
                <p className="text-xs text-white/45">Golden Hour Rescue: {progressPct}%</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-white/10"
                >
                  {speed}x
                </button>
                <Button
                  className="px-4 py-2"
                  onClick={() => {
                    if (t >= 18) setT(0);
                    setRunning((r) => !r);
                  }}
                >
                  {running ? <Pause size={15} /> : t >= 18 ? <RotateCcw size={15} /> : <Play size={15} fill="currentColor" />}
                  {running ? 'Pause' : t >= 18 ? 'Replay' : 'Simulate'}
                </Button>
              </div>
            </div>

            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-alert via-gold to-teal transition-all duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <ol className="flex-1 space-y-2.5 overflow-y-auto">
              {scenario.events.map((e) => {
                const visible = t >= e.at && started;
                return (
                  <li
                    key={e.text}
                    className={cn(
                      'flex items-start gap-2.5 rounded-xl border px-3 py-2 text-xs transition-all duration-500',
                      visible
                        ? 'translate-x-0 border-white/10 bg-white/[0.04] opacity-100'
                        : 'translate-x-3 border-transparent opacity-25'
                    )}
                  >
                    <span className="mt-0.5 font-mono text-[10px] text-white/45">+{String(Math.floor(e.at)).padStart(2, '0')}s</span>
                    <span className={e.tone}>{e.text}</span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-[11px] text-white/40">Simulation only. In any real emergency, dial 112 / 108 first.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
