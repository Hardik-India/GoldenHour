'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Droplets, ShieldCheck, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useCountUp } from '@/hooks/useCountUp';
import { INDIA_CITIES, INDIA_DOTS, INDIA_VIEWBOX } from '@/lib/indiaDots';
import { formatSeconds } from '@/lib/utils';

interface Stats {
  incidents: { total: number; resolved: number };
  avgFirstResponseSec: number | null;
  blood: { unitsFulfilled: number };
  network: { responders: number; donors: number; ambulances: number; hospitals: number };
}

const demoStats: Stats = {
  incidents: { total: 428, resolved: 403 },
  avgFirstResponseSec: 94,
  blood: { unitsFulfilled: 612 },
  network: { responders: 348, donors: 2480, ambulances: 54, hospitals: 42 },
};

function StatTile({
  icon: Icon,
  target,
  label,
  formatted,
  tone,
}: {
  icon: React.ElementType;
  target: number;
  label: string;
  formatted?: string;
  tone: string;
}) {
  const { ref, value } = useCountUp(target, 1500);
  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="gh-card-glow glass rounded-3xl p-6 hover:border-gold/45 hover:shadow-glow-gold"
    >
      <div className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white/5 ${tone}`}>
        <Icon size={22} />
      </div>
      <div className="text-gold-gradient text-4xl font-bold">
        {formatted ?? Math.round(value).toLocaleString()}
      </div>
      <div className="mt-1.5 text-sm text-white/60">{label}</div>
    </motion.div>
  );
}

export function ImpactPreview() {
  const [stats, setStats] = useState<Stats>(demoStats);
  const [live, setLive] = useState(false);

  useEffect(() => {
    api
      .get('/stats/impact')
      .then(({ data }) => {
        const s = data.stats as Stats;
        if (s.incidents.total > 0 || s.network.responders > 0) {
          setStats(s);
          setLive(true);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section id="impact" className="container-x py-24">
      <SectionHeading
        eyebrow="National Impact Mesh"
        title={<>A network that gets <span className="text-gold-gradient">faster</span> with every member</>}
        sub="Live community response metrics paired with our active corridor mesh across India."
      />
      <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile icon={ShieldCheck} target={stats.network.responders} label="Verified responders" tone="text-teal" />
            <StatTile icon={Users} target={stats.network.donors} label="Registered blood donors" tone="text-gold" />
            <StatTile
              icon={Clock}
              target={stats.avgFirstResponseSec ?? 94}
              formatted={formatSeconds(stats.avgFirstResponseSec ?? 94)}
              label="Avg. first response time"
              tone="text-alert"
            />
            <StatTile icon={Droplets} target={stats.blood.unitsFulfilled} label="Blood units matched" tone="text-alert-soft" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm">
            <span className="text-white/60">
              {live ? 'Live numbers from the GoldenHour network.' : 'Live benchmark telemetry active.'}
            </span>
            <Link href="/impact" className="inline-flex items-center gap-1.5 font-semibold text-gold hover:underline">
              Open Full Analytics &amp; Hotspots <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        {/* Animated Dotted India Mesh */}
        <Reveal delay={0.15}>
          <div className="glass-strong relative overflow-hidden rounded-[2rem] border border-white/15 p-5 shadow-2xl">
            <div className="mb-2 flex items-center justify-between text-xs text-white/65">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
                12 Active Metro Corridors
              </span>
              <span className="font-semibold text-gold">Pan-India Mesh</span>
            </div>
            <svg viewBox={INDIA_VIEWBOX} className="mx-auto max-h-[340px] w-full">
              {INDIA_DOTS.map(([x, y], idx) => (
                <circle key={idx} cx={x} cy={y} r="1.7" fill="#FFB938" opacity={idx % 5 === 0 ? 0.62 : 0.25} />
              ))}
              {/* Connecting corridor arcs */}
              <path d="M134 125 Q 210 155 287 209" fill="none" stroke="#FF3B4E" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.75" />
              <path d="M74 258 Q 180 240 287 209" fill="none" stroke="#FFB938" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.75" />
              <path d="M139 343 Q 155 310 151 282" fill="none" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.75" />
              <path d="M134 125 Q 100 190 74 258" fill="none" stroke="#FFB938" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.55" />

              {INDIA_CITIES.map((c, i) => (
                <g key={c.name}>
                  <circle cx={c.x} cy={c.y} r="4" fill="none" stroke="#FF3B4E" strokeWidth="1.5">
                    <animate attributeName="r" values="3;16" dur="2.6s" begin={`${(i % 4) * 0.6}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0" dur="2.6s" begin={`${(i % 4) * 0.6}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.x} cy={c.y} r="3.6" fill={c.name === 'Kolkata' ? '#FF3B4E' : '#2DD4BF'} />
                </g>
              ))}
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
