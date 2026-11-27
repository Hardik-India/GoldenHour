'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity, AlertTriangle, CheckCircle2, Flame, HeartPulse, HelpCircle,
  Search, ShieldAlert, Siren, Sparkles, Wind, XCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { CprMetronome } from '@/components/app/CprMetronome';
import { api } from '@/lib/api';
import { OFFLINE_GUIDES } from '@/lib/offlineGuides';
import type { FirstAidGuide } from '@/lib/types';
import { cn } from '@/lib/utils';

const MYTHS = [
  { myth: 'Cut a snakebite or suck out the venom', fact: 'Never cut, suck, or tie a tight tourniquet. Immobilise the limb and rush to a hospital with Anti-Snake Venom.' },
  { myth: 'Apply toothpaste, butter, or ice on burns', fact: 'Use only cool running tap water for 20 minutes. Toothpaste traps heat and increases infection.' },
  { myth: 'Force a metal spoon into the mouth during a seizure', fact: 'Never force anything into the mouth. Cushion the head, time the fit, and turn onto their side afterward.' },
  { myth: 'Pull a biker helmet off immediately after a crash', fact: 'Leave the helmet on to protect the neck spine unless the rider is not breathing and you are trained.' },
];

const QUIZ = [
  { q: 'Recommended chest compression rate for adult hands-only CPR?', options: ['60–80 BPM', '100–120 BPM', '140–160 BPM'], ans: 1 },
  { q: 'Blood soaks through the first cloth on a severe wound. What do you do?', options: ['Lift and wipe the wound clean', 'Stack more cloth on top and keep pressing', 'Pour cold water over it'], ans: 1 },
  { q: 'First step for a thermal burn on the arm?', options: ['Rub ice cubes directly', 'Apply white toothpaste', 'Cool under running water for 20 minutes'], ans: 2 },
  { q: 'A person is having a seizure. What is the safest first action?', options: ['Hold their arms still', 'Cushion the head and clear sharp objects', 'Put water in their mouth'], ans: 1 },
];

const PANIC_SHORTCUTS = [
  { label: 'Not Breathing', slug: 'cpr-adult', cue: 'Start 110 BPM CPR immediately', tone: 'border-alert/40 bg-alert/15 text-alert-soft' },
  { label: 'Heavy Bleeding', slug: 'severe-bleeding', cue: 'Press hard · Never lift cloth', tone: 'border-alert/35 bg-alert/10 text-alert-soft' },
  { label: 'Choking', slug: 'choking-adult', cue: '5 back blows · 5 thrusts', tone: 'border-gold/40 bg-gold/15 text-gold' },
  { label: 'Snakebite', slug: 'snakebite', cue: 'Immobilise · Zero cutting', tone: 'border-teal/40 bg-teal/15 text-teal' },
];

const catIcon: Record<string, React.ElementType> = {
  cardiac: HeartPulse,
  trauma: ShieldAlert,
  airway: Wind,
  poisoning: AlertTriangle,
  environmental: Flame,
  neuro: Activity,
};

export default function FirstAidIndex() {
  const [items, setItems] = useState<FirstAidGuide[]>(OFFLINE_GUIDES);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    api
      .get('/first-aid')
      .then(({ data }) => {
        if (Array.isArray(data.items) && data.items.length > 0) {
          const apiSlugs = new Set(data.items.map((g: FirstAidGuide) => g.slug));
          const extraOffline = OFFLINE_GUIDES.filter((g) => !apiSlugs.has(g.slug));
          setItems([...data.items, ...extraOffline]);
        }
      })
      .catch(() => undefined);
  }, []);

  const categories = ['all', ...Array.from(new Set(items.map((g) => g.category)))];

  const filtered = useMemo(() => {
    return items.filter((g) => {
      const matchCat = category === 'all' || g.category === category;
      const q = query.trim().toLowerCase();
      const matchQ = !q || g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [items, category, query]);

  const currentQ = QUIZ[quizIdx];

  return (
    <AppShell requireAuth={false}>
      <div className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Offline-Ready Life-Saving Studio</span>
            <h1 className="mt-1 text-3xl font-bold">Interactive First-Aid Hub</h1>
          </div>
          <Link href="/sos" className="inline-flex items-center gap-2 rounded-full bg-red-btn px-5 py-2.5 text-sm font-semibold text-white shadow-glow-red">
            <Siren size={16} /> Urgent Emergency? Raise SOS
          </Link>
        </div>

        <EmergencyBanner />

        {/* Panic Quick-Jump Bar */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PANIC_SHORTCUTS.map((p) => (
            <Link
              key={p.slug}
              href={`/first-aid/${p.slug}`}
              className={cn('gh-card-glow flex flex-col justify-between rounded-2xl border p-4 transition hover:-translate-y-0.5', p.tone)}
            >
              <div className="text-sm font-bold">{p.label} →</div>
              <div className="mt-1 text-xs text-white/75">{p.cue}</div>
            </Link>
          ))}
        </div>

        {/* Full-Width 2-Column Interactive Studio */}
        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* LEFT: Searchable Protocol Grid + Myth Busters */}
          <div className="space-y-6">
            <div className="glass-strong rounded-3xl p-5">
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    className="input pl-10"
                    placeholder="Search symptoms or protocols: CPR, bleeding, snakebite, burns, seizure..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition',
                        category === c ? 'bg-gold text-night shadow-glow-gold' : 'bg-white/5 text-white/65 hover:bg-white/10'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((g) => {
                const Icon = catIcon[g.category] || Activity;
                return (
                  <Link
                    key={g.slug}
                    href={`/first-aid/${g.slug}`}
                    className="gh-card-glow glass group flex flex-col justify-between rounded-3xl border border-white/10 p-5 hover:border-gold/55 hover:shadow-glow-gold"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-alert/15 text-alert-soft transition group-hover:scale-110">
                          <Icon size={21} />
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-gold">
                          {g.category}
                        </span>
                      </div>
                      <h2 className="text-lg font-semibold text-white group-hover:text-gold">{g.title}</h2>
                      <p className="mt-1.5 text-sm text-white/60">{g.summary}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-teal">
                      <span>Voice + step checklist</span>
                      <span className="font-semibold">Open protocol →</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* India First-Aid Myth-Busters */}
            <div className="glass rounded-3xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <Flame size={18} className="text-gold" />
                <h2 className="text-lg font-semibold">Critical Do vs. Don&apos;t Myth-Busters</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {MYTHS.map((m) => (
                  <div key={m.myth} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs leading-relaxed">
                    <div className="flex items-start gap-2 font-semibold text-alert-soft">
                      <XCircle size={15} className="mt-0.5 shrink-0" />
                      <span>Myth: {m.myth}</span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 text-white/75">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal" />
                      <span>{m.fact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Live 110 BPM CPR Coach + Golden Hour Reflex Drill */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-alert-soft">
                <HeartPulse size={14} /> Instant Cardiac Arrest Tool
              </div>
              <CprMetronome />
            </div>

            <div className="glass-strong rounded-3xl border border-gold/25 p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles size={17} className="text-gold" /> Golden Hour Reflex Drill
                </div>
                <span className="rounded-full bg-gold/15 px-3 py-0.5 text-xs font-bold text-gold">
                  Score: {quizScore}/{QUIZ.length}
                </span>
              </div>
              <p className="mb-4 text-sm text-white/85">{currentQ.q}</p>
              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const isCorrect = idx === currentQ.ans;
                  const chosen = picked === idx;
                  return (
                    <button
                      key={opt}
                      disabled={picked !== null}
                      onClick={() => {
                        setPicked(idx);
                        if (isCorrect) setQuizScore((s) => s + 1);
                      }}
                      className={cn(
                        'w-full rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition',
                        picked === null
                          ? 'border-white/10 bg-white/5 hover:border-gold/50'
                          : isCorrect
                          ? 'border-teal bg-teal/20 text-teal'
                          : chosen
                          ? 'border-alert bg-alert/20 text-alert-soft'
                          : 'border-white/5 opacity-45'
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {picked !== null && (
                <button
                  onClick={() => {
                    setPicked(null);
                    if (quizIdx + 1 < QUIZ.length) setQuizIdx((i) => i + 1);
                    else {
                      setQuizIdx(0);
                      setQuizScore(0);
                    }
                  }}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                >
                  <HelpCircle size={14} />
                  {quizIdx + 1 < QUIZ.length ? 'Next question →' : 'Restart drill'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
