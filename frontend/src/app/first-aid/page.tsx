'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { api } from '@/lib/api';
import type { FirstAidGuide } from '@/lib/types';

export default function FirstAidIndex() {
  const [items, setItems] = useState<FirstAidGuide[]>([]);
  useEffect(() => {
    api.get('/first-aid').then(({ data }) => setItems(data.items)).catch(() => undefined);
  }, []);

  return (
    <AppShell requireAuth={false}>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">First-aid guides</h1>
        <EmergencyBanner />
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((g) => (
            <Link key={g.slug} href={`/first-aid/${g.slug}`} className="glass group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-gold/50">
              <HeartPulse className="mb-3 text-alert" />
              <div className="font-semibold">{g.title}</div>
              <p className="mt-1 text-sm text-white/55">{g.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
