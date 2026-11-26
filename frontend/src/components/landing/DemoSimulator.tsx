'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const CENTER = { x: 300, y: 200 };

const responders = [
  { name: 'Aarav', start: { x: 90, y: 70 }, accept: 3.0, arrive: 11 },
  { name: 'Diya', start: { x: 520, y: 90 }, accept: 4.2, arrive: 13 },
  { name: 'Rohan', start: { x: 500, y: 330 }, accept: 5.5, arrive: 15 },
  { name: 'Meera', start: { x: 70, y: 320 }, accept: 99, arrive: 99 }, // never accepts (declines)
];

const ambulance = { start: { x: 40, y: 200 }, dispatch: 6, arrive: 17 };

const events = [
  { at: 0.0, text: 'SOS raised - location shared', tone: 'text-alert' },
  { at: 1.0, text: '4 verified responders alerted within 3 km', tone: 'text-gold' },
  { at: 3.0, text: 'Aarav accepted - ETA 2 min', tone: 'text-teal' },
  { at: 4.2, text: 'Diya accepted - ETA 3 min', tone: 'text-teal' },
  { at: 5.5, text: 'Rohan accepted - ETA 3 min', tone: 'text-teal' },
  { at: 6.0, text: 'Ambulance dispatched - ETA 3 min', tone: 'text-gold' },
  { at: 7.0, text: 'Guided CPR started on the caller phone', tone: 'text-white/80' },
  { at: 11.0, text: 'Aarav arrived on scene', tone: 'text-teal' },
  { at: 17.0, text: 'Ambulance arrived - handoff complete', tone: 'text-teal' },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.min(1, Math.max(0, t));

export function DemoSimulator() {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - t * 1000;
    const loop = (now: number) => {
      const next = (now - startRef.current) / 1000;
      if (next >= 18) {
        setT(18);
        setRunning(false);
        return;
      }
      setT(next);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const started = t > 0 || running;
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(Math.floor(t % 60)).padStart(2, '0');

  const ambT = (t - ambulance.dispatch) / (ambulance.arrive - ambulance.dispatch);
  const ambX = lerp(ambulance.start.x, CENTER.x, ambT);
  const ambY = lerp(ambulance.start.y, CENTER.y, ambT);

  return (
    <section id="demo" className="container-x py-20">
      <SectionHeading
        eyebrow="Live demo"
        title={<>Watch a rescue <span className="text-gold-gradient">unfold</span></>}
        sub="A simulated road accident. Press the button to see alerts, responders and an ambulance converge."
      />

      <div className="glass overflow-hidden rounded-[2rem] p-3 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* map */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0A0F1D]">
            <svg viewBox="0 0 600 400" className="block w-full">
              <g stroke="#17233C" strokeWidth="1.4" fill="none">
                {[80, 160, 240, 320].map((y) => <path key={y} d={`M0 ${y}H600`} />)}
                {[100, 200, 300, 400, 500].map((x) => <path key={x} d={`M${x} 0V400`} />)}
                <path d="M0 360 Q 200 300 600 340" stroke="#1B3A5E" strokeWidth="12" opacity="0.45" />
              </g>

              {/* range ring */}
              <circle cx={CENTER.x} cy={CENTER.y} r="190" fill="none" stroke="#FFB938" strokeOpacity="0.15" strokeDasharray="4 8" />

              {/* responders */}
              {responders.map((r) => {
                const accepted = t >= r.accept;
                const notified = t >= 1;
                const p = (t - r.accept) / (r.arrive - r.accept);
                const x = accepted ? lerp(r.start.x, CENTER.x, p) : r.start.x;
                const y = accepted ? lerp(r.start.y, CENTER.y, p) : r.start.y;
                const declined = r.accept === 99 && t > 4;
                return (
                  <g key={r.name} opacity={declined ? 0.3 : 1}>
                    {accepted && (
                      <line x1={r.start.x} y1={r.start.y} x2={CENTER.x} y2={CENTER.y} stroke="#FFB938" strokeOpacity="0.5" strokeDasharray="5 7" />
                    )}
                    {notified && !accepted && !declined && (
                      <circle cx={x} cy={y} r="10" fill="none" stroke="#FFB938" strokeWidth="1.5">
                        <animate attributeName="r" values="8;22" dur="1.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9;0" dur="1.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={x} cy={y} r="8" fill={accepted ? '#FFB938' : '#6b7690'} />
                    <circle cx={x} cy={y} r="3" fill="#fff" />
                    <text x={x} y={y - 14} textAnchor="middle" fill="#fff" fontSize="11" opacity="0.8">
                      {r.name}
                    </text>
                  </g>
                );
              })}

              {/* ambulance */}
              {t >= ambulance.dispatch && (
                <g>
                  <rect x={ambX - 14} y={ambY - 9} width="28" height="18" rx="4" fill="#fff" />
                  <rect x={ambX - 14} y={ambY - 9} width="28" height="5" rx="2" fill="#FF3B4E" />
                  <text x={ambX} y={ambY + 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#D41F33">+</text>
                  <circle cx={ambX} cy={ambY - 12} r="3" fill="#FF3B4E">
                    <animate attributeName="fill" values="#FF3B4E;#3b82f6;#FF3B4E" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* accident */}
              {started && (
                <>
                  {[0, 0.8, 1.6].map((b) => (
                    <circle key={b} cx={CENTER.x} cy={CENTER.y} r="18" fill="none" stroke="#FF3B4E" strokeWidth="2">
                      <animate attributeName="r" values="18;90" dur="2.4s" begin={`${b}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin={`${b}s`} repeatCount="indefinite" />
                    </circle>
                  ))}
                </>
              )}
              <circle cx={CENTER.x} cy={CENTER.y} r="18" fill="#FF3B4E" />
              <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">SOS</text>
            </svg>

            <div className="absolute left-4 top-4 rounded-full border border-alert/40 bg-alert/15 px-4 py-1.5 text-sm font-semibold">
              {mm}:{ss}
            </div>
          </div>

          {/* timeline */}
          <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Live timeline</h3>
              {!running ? (
                <Button className="px-5 py-2" onClick={() => { setT(0); setRunning(true); }}>
                  {t >= 18 ? <RotateCcw size={16} /> : <Play size={16} fill="currentColor" />}
                  {t >= 18 ? 'Replay' : 'Simulate accident'}
                </Button>
              ) : (
                <span className="text-xs text-white/50">Simulating...</span>
              )}
            </div>
            <ol className="flex-1 space-y-3">
              {events.map((e) => {
                const visible = t >= e.at && started;
                return (
                  <li
                    key={e.text}
                    className={`flex gap-3 text-sm transition-all duration-500 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}`}
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-current" style={{ color: 'inherit' }} />
                    <span className={e.tone}>{e.text}</span>
                  </li>
                );
              })}
              {!started && <li className="text-sm text-white/40">Press &quot;Simulate accident&quot; to begin.</li>}
            </ol>
            <p className="mt-4 text-xs text-white/40">Simulation only. In a real emergency, call 112 / 108 first.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
