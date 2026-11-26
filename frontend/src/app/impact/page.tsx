'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '@/components/app/AppShell';
import LiveMap from '@/components/map/LiveMap';
import { api } from '@/lib/api';
import { DEFAULT_CENTER, formatSeconds } from '@/lib/utils';

interface Stats {
  incidents: { total: number; resolved: number };
  avgFirstResponseSec: number | null;
  blood: { requests: number; fulfilled: number; unitsFulfilled: number };
  network: { responders: number; donors: number; ambulances: number; hospitals: number };
  incidentsByType: { type: string; count: number }[];
  incidentsLast7Days: { date: string; count: number }[];
}

const COLORS = ['#FF3B4E', '#FFB938', '#2DD4BF', '#FF6B79', '#7CE8DA', '#FFD27A', '#8892a8'];

export default function ImpactPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [hot, setHot] = useState<{ lat: number; lng: number; count: number }[]>([]);

  useEffect(() => {
    const load = () => {
      api.get('/stats/impact').then(({ data }) => setStats(data.stats)).catch(() => undefined);
      api.get('/stats/hotspots').then(({ data }) => setHot(data.items)).catch(() => undefined);
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const cards = stats
    ? [
        ['Incidents handled', stats.incidents.total],
        ['Resolved', stats.incidents.resolved],
        ['Avg. first response', formatSeconds(stats.avgFirstResponseSec)],
        ['Blood units matched', stats.blood.unitsFulfilled],
        ['Verified responders', stats.network.responders],
        ['Registered donors', stats.network.donors],
        ['Ambulances', stats.network.ambulances],
        ['Hospitals', stats.network.hospitals],
      ]
    : [];

  const center = hot[0] ? ([hot[0].lat, hot[0].lng] as [number, number]) : DEFAULT_CENTER;

  return (
    <AppShell requireAuth={false}>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Impact dashboard</h1>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(([l, v]) => (
            <div key={l as string} className="glass rounded-3xl p-5">
              <div className="text-gold-gradient text-3xl font-bold">{v}</div>
              <div className="mt-1 text-sm text-white/55">{l}</div>
            </div>
          ))}
        </div>

        {stats && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass rounded-3xl p-5">
              <h3 className="mb-3 font-semibold">Incidents, last 7 days</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={stats.incidentsLast7Days}>
                    <CartesianGrid stroke="#ffffff14" />
                    <XAxis dataKey="date" stroke="#8892a8" fontSize={11} />
                    <YAxis stroke="#8892a8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#121829', border: '1px solid #ffffff22', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#FFB938" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass rounded-3xl p-5">
              <h3 className="mb-3 font-semibold">By emergency type</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={stats.incidentsByType} dataKey="count" nameKey="type" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {stats.incidentsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#121829', border: '1px solid #ffffff22', borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass rounded-3xl p-5 lg:col-span-2">
              <h3 className="mb-3 font-semibold">Network</h3>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={[
                    { name: 'Responders', v: stats.network.responders },
                    { name: 'Donors', v: stats.network.donors },
                    { name: 'Ambulances', v: stats.network.ambulances },
                    { name: 'Hospitals', v: stats.network.hospitals },
                  ]}>
                    <CartesianGrid stroke="#ffffff14" />
                    <XAxis dataKey="name" stroke="#8892a8" fontSize={11} />
                    <YAxis stroke="#8892a8" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#121829', border: '1px solid #ffffff22', borderRadius: 12 }} />
                    <Bar dataKey="v" fill="#2DD4BF" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 font-semibold">Accident hotspots (anonymised ~1 km grid)</h3>
          <LiveMap
            center={center}
            zoom={12}
            markers={hot.slice(0, 40).map((h, i) => ({ id: `h${i}`, lat: h.lat, lng: h.lng, kind: 'sos', label: `${h.count} incident(s)` }))}
            className="h-[360px] w-full rounded-3xl"
          />
        </div>
      </div>
    </AppShell>
  );
}
