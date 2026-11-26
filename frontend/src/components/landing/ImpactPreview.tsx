'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatSeconds } from '@/lib/utils';

interface Stats {
  incidents: { total: number; resolved: number };
  avgFirstResponseSec: number | null;
  blood: { unitsFulfilled: number };
  network: { responders: number; donors: number; ambulances: number; hospitals: number };
}

const demoStats: Stats = {
  incidents: { total: 128, resolved: 117 },
  avgFirstResponseSec: 96,
  blood: { unitsFulfilled: 342 },
  network: { responders: 214, donors: 1860, ambulances: 36, hospitals: 28 },
};

export function ImpactPreview() {
  const [stats, setStats] = useState<Stats>(demoStats);
  const [live, setLive] = useState(false);

  useEffect(() => {
    api
      .get('/stats/impact')
      .then(({ data }) => {
        const s = data.stats as Stats;
        // Only show real numbers once there is real activity; otherwise keep the demo set.
        if (s.incidents.total > 0 || s.network.responders > 0) {
          setStats(s);
          setLive(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const items = [
    { label: 'Verified responders', value: stats.network.responders.toLocaleString() },
    { label: 'Registered donors', value: stats.network.donors.toLocaleString() },
    { label: 'Avg. first response', value: formatSeconds(stats.avgFirstResponseSec) },
    { label: 'Blood units matched', value: stats.blood.unitsFulfilled.toLocaleString() },
  ];

  return (
    <section id="impact" className="container-x py-20">
      <SectionHeading eyebrow="Impact" title={<>A network that gets <span className="text-gold-gradient">faster</span> with every member</>} />
      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div key={i.label} className="glass rounded-3xl p-6 text-center">
              <div className="text-gold-gradient text-4xl font-bold">{i.value}</div>
              <div className="mt-2 text-sm text-white/60">{i.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/40">
          {live ? 'Live numbers from the GoldenHour network.' : 'Sample numbers shown for demo.'}{' '}
          <Link href="/impact" className="text-gold underline">
            Open the full dashboard
          </Link>
        </p>
      </Reveal>
    </section>
  );
}
