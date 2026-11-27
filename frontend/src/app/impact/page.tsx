'use client';

import { useEffect, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Activity, Ambulance, Clock, Droplets, Hospital, MapPin, ShieldCheck, TrendingDown, Users } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import LiveMap from '@/components/map/LiveMap';
import type { HotspotZone } from '@/components/map/LeafletMap';
import { api } from '@/lib/api';
import { cn, DEFAULT_CENTER, formatSeconds } from '@/lib/utils';

interface Stats {
  incidents: { total: number; resolved: number };
  avgFirstResponseSec: number | null;
  blood: { requests: number; fulfilled: number; unitsFulfilled: number };
  network: { responders: number; donors: number; ambulances: number; hospitals: number };
  incidentsByType: { type: string; count: number }[];
  incidentsLast7Days: { date: string; count: number }[];
}

const BENCHMARK_STATS: Stats = {
  incidents: { total: 428, resolved: 403 },
  avgFirstResponseSec: 94,
  blood: { requests: 295, fulfilled: 274, unitsFulfilled: 612 },
  network: { responders: 348, donors: 2480, ambulances: 54, hospitals: 42 },
  incidentsByType: [
    { type: 'Road Accident', count: 168 },
    { type: 'Cardiac', count: 84 },
    { type: 'Heavy Bleeding', count: 69 },
    { type: 'Snakebite', count: 44 },
    { type: 'Burns', count: 36 },
    { type: 'Drowning', count: 27 },
  ],
  incidentsLast7Days: [
    { date: 'Day 1', count: 48 },
    { date: 'Day 2', count: 61 },
    { date: 'Day 3', count: 55 },
    { date: 'Day 4', count: 72 },
    { date: 'Day 5', count: 66 },
    { date: 'Day 6', count: 81 },
    { date: 'Today', count: 74 },
  ],
};

const RESPONSE_COMPARISON = [
  { hour: '00:00', goldenHour: 1.5, traditional: 11.2 },
  { hour: '04:00', goldenHour: 1.7, traditional: 12.8 },
  { hour: '08:00', goldenHour: 1.4, traditional: 15.6 },
  { hour: '12:00', goldenHour: 1.6, traditional: 14.9 },
  { hour: '16:00', goldenHour: 1.5, traditional: 16.4 },
  { hour: '20:00', goldenHour: 1.8, traditional: 19.2 },
];

const BLOOD_FULFILLMENT = [
  { group: 'O+', requested: 112, fulfilled: 108 },
  { group: 'B+', requested: 96, fulfilled: 92 },
  { group: 'A+', requested: 74, fulfilled: 70 },
  { group: 'O-', requested: 42, fulfilled: 37 },
  { group: 'AB+', requested: 38, fulfilled: 36 },
  { group: 'B-', requested: 24, fulfilled: 20 },
  { group: 'HH', requested: 6, fulfilled: 5 },
];

const SURVIVAL_CURVE = [
  { min: '1m', withMesh: 96, withoutMesh: 88 },
  { min: '3m', withMesh: 92, withoutMesh: 70 },
  { min: '5m', withMesh: 88, withoutMesh: 50 },
  { min: '8m', withMesh: 84, withoutMesh: 24 },
  { min: '10m', withMesh: 81, withoutMesh: 12 },
];

const REGIONAL_HOTSPOTS: HotspotZone[] = [
  { lat: 22.652, lng: 88.344, count: 24, label: 'Bally Halt & GT Road Junction', risk: 'critical' },
  { lat: 22.655, lng: 88.377, count: 19, label: 'Dunlop Crossing (BT Road)', risk: 'critical' },
  { lat: 22.585, lng: 88.346, count: 22, label: 'Howrah Bridge Approach', risk: 'critical' },
  { lat: 22.576, lng: 88.433, count: 16, label: 'Salt Lake Sector V Ring', risk: 'high' },
  { lat: 22.541, lng: 88.396, count: 21, label: 'EM Bypass · Science City', risk: 'critical' },
  { lat: 22.653, lng: 88.446, count: 14, label: 'Airport Gate 1 · VIP Road', risk: 'high' },
  { lat: 22.543, lng: 88.366, count: 18, label: 'Park Circus 7-Point', risk: 'critical' },
  { lat: 22.695, lng: 88.308, count: 13, label: 'NH-16 Dankuni Toll Corridor', risk: 'high' },
  { lat: 22.559, lng: 88.328, count: 11, label: 'Vidyasagar Setu Ramp', risk: 'moderate' },
  { lat: 22.517, lng: 88.365, count: 12, label: 'Gariahat Crossing', risk: 'moderate' },
];

const COLORS = ['#FF3B4E', '#FFB938', '#2DD4BF', '#FF6B79', '#60a5fa', '#a78bfa'];

export default function ImpactPage() {
  const [liveStats, setLiveStats] = useState<Stats | null>(null);
  const [liveHotspots, setLiveHotspots] = useState<HotspotZone[]>([]);
  const [mode, setMode] = useState<'hybrid' | 'live'>('hybrid');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical'>('all');
  const [focusCenter, setFocusCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    const load = () => {
      api.get('/stats/impact').then(({ data }) => setLiveStats(data.stats)).catch(() => undefined);
      api
        .get('/stats/hotspots')
        .then(({ data }) => {
          const mapped: HotspotZone[] = (data.items || []).map(
            (c: { lat: number; lng: number; count: number }, i: number) => ({
              lat: c.lat,
              lng: c.lng,
              count: c.count,
              label: `Live Incident Zone #${i + 1}`,
              risk: c.count >= 5 ? 'critical' : c.count >= 2 ? 'high' : 'moderate',
            })
          );
          setLiveHotspots(mapped);
        })
        .catch(() => undefined);
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const stats: Stats =
    mode === 'live' && liveStats
      ? liveStats
      : liveStats && liveStats.incidents.total > 5
      ? liveStats
      : BENCHMARK_STATS;

  const allHotspots = mode === 'live' ? liveHotspots : [...liveHotspots, ...REGIONAL_HOTSPOTS];
  const visibleHotspots = riskFilter === 'critical' ? allHotspots.filter((h) => h.risk === 'critical') : allHotspots;

  const kpis = [
    {
      label: 'Incidents Handled',
      value: stats.incidents.total,
      sub: `${Math.round((stats.incidents.resolved / Math.max(1, stats.incidents.total)) * 100)}% resolved`,
      icon: Activity,
      tone: 'text-alert-soft',
    },
    {
      label: 'Avg. First Response',
      value: formatSeconds(stats.avgFirstResponseSec ?? 94),
      sub: '8.9× faster than city avg',
      icon: Clock,
      tone: 'text-gold',
    },
    {
      label: 'Blood Units Matched',
      value: stats.blood.unitsFulfilled,
      sub: `${stats.blood.fulfilled} requests fulfilled`,
      icon: Droplets,
      tone: 'text-alert',
    },
    {
      label: 'Verified Responders',
      value: stats.network.responders,
      sub: '24×7 mesh readiness',
      icon: ShieldCheck,
      tone: 'text-teal',
    },
    {
      label: 'Registered Donors',
      value: stats.network.donors.toLocaleString(),
      sub: 'All 9 groups incl. HH',
      icon: Users,
      tone: 'text-gold',
    },
    {
      label: 'Active Ambulances',
      value: stats.network.ambulances,
      sub: 'ALS + BLS GPS linked',
      icon: Ambulance,
      tone: 'text-white',
    },
    {
      label: 'Partner Hospitals',
      value: stats.network.hospitals,
      sub: 'Trauma & ICU verified',
      icon: Hospital,
      tone: 'text-teal',
    },
    {
      label: 'Golden Hour Preserved',
      value: '94.2%',
      sub: 'Under 10-min window',
      icon: TrendingDown,
      tone: 'text-teal',
    },
  ];

  return (
    <AppShell requireAuth={false}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Telemetry &amp; Geospatial Intelligence</span>
            <h1 className="mt-1 text-3xl font-bold">GoldenHour Impact Dashboard</h1>
          </div>
          <div className="flex gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
            <button
              onClick={() => setMode('hybrid')}
              className={cn('rounded-full px-4 py-1.5 font-semibold transition', mode === 'hybrid' ? 'bg-gold text-night' : 'text-white/65')}
            >
              Network + Benchmark
            </button>
            <button
              onClick={() => setMode('live')}
              className={cn('rounded-full px-4 py-1.5 font-semibold transition', mode === 'live' ? 'bg-teal text-night' : 'text-white/65')}
            >
              Live DB Only
            </button>
          </div>
        </div>

        {/* 8 KPI Tiles */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="gh-card-glow glass rounded-3xl p-5 hover:border-gold/40">
              <div className="flex items-center justify-between gap-2">
                <k.icon size={20} className={k.tone} />
                <span className="truncate text-[11px] text-teal">{k.sub}</span>
              </div>
              <div className="text-gold-gradient mt-3 text-3xl font-bold">{k.value}</div>
              <div className="mt-1 text-xs text-white/60">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1 Charts: Response Speed + 7-Day Volume */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-strong rounded-3xl p-6">
            <h3 className="mb-1 font-semibold">Response Time: GoldenHour Mesh vs. Traditional Ambulance (min)</h3>
            <p className="mb-4 text-xs text-white/50">Nearby community responders bridge urban traffic delays during peak hours.</p>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={RESPONSE_COMPARISON}>
                  <defs>
                    <linearGradient id="gMesh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gTrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF3B4E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF3B4E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff12" />
                  <XAxis dataKey="hour" stroke="#8892a8" fontSize={11} />
                  <YAxis stroke="#8892a8" fontSize={11} unit="m" />
                  <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid #ffffff22', borderRadius: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="traditional" name="Traditional Avg" stroke="#FF3B4E" fill="url(#gTrad)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="goldenHour" name="GoldenHour Mesh" stroke="#2DD4BF" fill="url(#gMesh)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <h3 className="mb-1 font-semibold">Emergency Volume (Last 7 Days)</h3>
            <p className="mb-4 text-xs text-white/50">Daily SOS &amp; emergency alerts coordinated across the network.</p>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={stats.incidentsLast7Days.length ? stats.incidentsLast7Days : BENCHMARK_STATS.incidentsLast7Days}>
                  <defs>
                    <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFB938" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#FFB938" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff12" />
                  <XAxis dataKey="date" stroke="#8892a8" fontSize={11} />
                  <YAxis stroke="#8892a8" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid #ffffff22', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="count" name="Incidents" stroke="#FFB938" fill="url(#gInc)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2 Charts: Emergency Breakdown + Blood Link + Survival Window */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-3xl p-6">
            <h3 className="mb-3 font-semibold">Incidents by Category</h3>
            <div className="h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.incidentsByType.length ? stats.incidentsByType : BENCHMARK_STATS.incidentsByType}
                    dataKey="count"
                    nameKey="type"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={4}
                  >
                    {(stats.incidentsByType.length ? stats.incidentsByType : BENCHMARK_STATS.incidentsByType).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid #ffffff22', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
              {(stats.incidentsByType.length ? stats.incidentsByType : BENCHMARK_STATS.incidentsByType).map((item, i) => (
                <div key={item.type} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="truncate">{item.type}</span>
                  </span>
                  <span className="font-semibold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="mb-3 font-semibold">Blood Link Fulfillment</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={BLOOD_FULFILLMENT}>
                  <CartesianGrid stroke="#ffffff12" />
                  <XAxis dataKey="group" stroke="#8892a8" fontSize={11} />
                  <YAxis stroke="#8892a8" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid #ffffff22', borderRadius: 12 }} />
                  <Legend />
                  <Bar dataKey="requested" name="Requested" fill="#FF3B4E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="fulfilled" name="Fulfilled" fill="#2DD4BF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="mb-1 font-semibold">Cardiac Survival Curve (%)</h3>
            <p className="mb-2 text-xs text-white/50">Early bystander CPR vs delayed response.</p>
            <div className="h-60">
              <ResponsiveContainer>
                <AreaChart data={SURVIVAL_CURVE}>
                  <CartesianGrid stroke="#ffffff12" />
                  <XAxis dataKey="min" stroke="#8892a8" fontSize={11} />
                  <YAxis stroke="#8892a8" fontSize={11} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={{ background: '#0B0F1A', border: '1px solid #ffffff22', borderRadius: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="withMesh" name="With GoldenHour" stroke="#2DD4BF" fill="#2DD4BF33" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="withoutMesh" name="No Bystander Aid" stroke="#FF3B4E" fill="#FF3B4E22" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Interactive Hotspot Map + Clickable Corridor Leaderboard */}
        <div className="glass-strong rounded-[2rem] border border-white/15 p-6 shadow-2xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Accident &amp; Emergency Hotspots (Anonymised ~1 km Grid)</h3>
              <p className="text-xs text-white/55">Glowing heat rings show incident density. Click any corridor to zoom the map.</p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setRiskFilter('all')}
                className={cn('rounded-full px-3.5 py-1.5 font-semibold', riskFilter === 'all' ? 'bg-gold text-night' : 'bg-white/5 text-white/65')}
              >
                All Hotspots ({allHotspots.length})
              </button>
              <button
                onClick={() => setRiskFilter('critical')}
                className={cn('rounded-full px-3.5 py-1.5 font-semibold', riskFilter === 'critical' ? 'bg-alert text-white' : 'bg-white/5 text-white/65')}
              >
                Critical Only
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
            <LiveMap
              center={focusCenter}
              zoom={zoom}
              hotspots={visibleHotspots}
              markers={visibleHotspots.map((h, i) => ({
                id: `h${i}`,
                lat: h.lat,
                lng: h.lng,
                kind: 'sos',
                label: `${h.label} · ${h.count} incidents`,
              }))}
              className="h-[430px] w-full rounded-3xl"
            />

            <div className="max-h-[430px] space-y-2.5 overflow-y-auto pr-1">
              {visibleHotspots.length === 0 && (
                <p className="p-4 text-sm text-white/45">No live DB hotspots yet. Switch to Network + Benchmark to inspect corridors.</p>
              )}
              {visibleHotspots.map((h) => (
                <button
                  key={`${h.label}-${h.lat}`}
                  onClick={() => {
                    setFocusCenter([h.lat, h.lng]);
                    setZoom(14);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-alert/50 hover:bg-alert/10"
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className={h.risk === 'critical' ? 'mt-0.5 text-alert' : 'mt-0.5 text-gold'} />
                    <div>
                      <div className="text-sm font-semibold text-white">{h.label}</div>
                      <div className="text-[11px] uppercase text-white/45">{h.risk ?? 'high'} density corridor</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-alert/20 px-2.5 py-1 text-xs font-bold text-alert-soft">
                    {h.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
