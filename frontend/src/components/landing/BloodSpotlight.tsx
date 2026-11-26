'use client';

import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { BLOOD_GROUPS } from '@/lib/types';

const donors = [
  { angle: 0, r: 120, delay: 0 },
  { angle: 120, r: 120, delay: 0.3 },
  { angle: 240, r: 120, delay: 0.6 },
  { angle: 60, r: 170, delay: 0.9 },
  { angle: 200, r: 170, delay: 1.2 },
];

export function BloodSpotlight() {
  return (
    <section className="container-x py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-alert">Blood Link</p>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Stop sending families <span className="text-gold-gradient">running for blood</span>
          </h2>
          <p className="mt-4 text-white/65">
            Many patients still depend on relatives hunting for donors after the need arises. Blood Link alerts
            eligible, compatible donors nearby the moment a request is posted, tracks who accepted, and respects the
            donation cool-down so people only give when it is safe.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {BLOOD_GROUPS.map((g) => (
              <span key={g} className="rounded-full border border-alert/30 bg-alert/10 px-3 py-1 text-sm font-medium text-alert-soft">
                {g === 'HH' ? 'Bombay (HH)' : g}
              </span>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Button href="/blood">Request blood</Button>
            <Button href="/register?role=donor" variant="glass">
              Become a donor
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto grid h-[380px] w-[380px] max-w-full place-items-center">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <div className="absolute inset-0 animate-orbit">
              {donors.map((d, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-night-700 text-[11px] font-semibold text-gold shadow-glow-gold"
                  style={{ transform: `rotate(${d.angle}deg) translate(${d.r}px) rotate(-${d.angle}deg) translate(-50%,-50%)` }}
                >
                  {['O+', 'A+', 'B-', 'AB+', 'O-'][i]}
                </span>
              ))}
            </div>
            <svg viewBox="0 0 100 130" className="h-40 drop-shadow-[0_0_30px_rgba(255,59,78,0.7)]">
              <path d="M50 4 C50 4 12 54 12 82 a38 38 0 0 0 76 0 C88 54 50 4 50 4Z" fill="url(#drop)" />
              <path d="M32 84 a18 18 0 0 0 14 18" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" fill="none" strokeLinecap="round" />
              <defs>
                <linearGradient id="drop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B79" />
                  <stop offset="100%" stopColor="#C41E30" />
                </linearGradient>
              </defs>
            </svg>
            <div className="glass-strong absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-2xl px-5 py-3 text-sm">
              <span className="text-teal">●</span> <b>3 donors found</b> within 2 km
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
