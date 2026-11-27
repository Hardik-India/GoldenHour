'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { CprMetronome } from '@/components/app/CprMetronome';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { OFFLINE_GUIDES } from '@/lib/offlineGuides';
import type { FirstAidGuide } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const offlineFallback = OFFLINE_GUIDES.find((g) => g.slug === slug) || null;
  const [guide, setGuide] = useState<FirstAidGuide | null>(offlineFallback);
  const [speaking, setSpeaking] = useState(false);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [timerSec, setTimerSec] = useState(0);
  const [timerOn, setTimerOn] = useState(false);

  useEffect(() => {
    api
      .get(`/first-aid/${slug}`)
      .then(({ data }) => {
        if (data.guide) setGuide(data.guide);
      })
      .catch(() => undefined);
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
    };
  }, [slug]);

  useEffect(() => {
    if (!timerOn) return;
    const id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerOn]);

  function toggleSpeech() {
    if (!guide || typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      return setSpeaking(false);
    }
    const text = guide.steps.map((s) => `Step ${s.order}. ${s.title}. ${s.text}`).join(' ');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function toggleStep(order: number) {
    setDoneSteps((prev) => (prev.includes(order) ? prev.filter((x) => x !== order) : [...prev, order]));
  }

  const mm = String(Math.floor(timerSec / 60)).padStart(2, '0');
  const ss = String(timerSec % 60).padStart(2, '0');

  return (
    <AppShell requireAuth={false}>
      <div className="space-y-6">
        <Link href="/first-aid" className="inline-flex items-center gap-1.5 text-sm text-white/65 hover:text-gold">
          <ArrowLeft size={16} /> Back to First-Aid Studio
        </Link>

        {!guide ? (
          <p className="text-white/50">Guide not found.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-gold/15 px-3 py-0.5 text-[11px] font-semibold uppercase text-gold">
                    {guide.category}
                  </span>
                  <h1 className="mt-2 text-3xl font-bold">{guide.title}</h1>
                  <p className="mt-1 text-sm text-white/60">{guide.summary}</p>
                </div>
                <Button variant="glass" className="px-4 py-2" onClick={toggleSpeech}>
                  {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />} {speaking ? 'Stop voice' : 'Read aloud'}
                </Button>
              </div>

              <EmergencyBanner />

              <ol className="space-y-3">
                {guide.steps.map((s) => {
                  const checked = doneSteps.includes(s.order);
                  return (
                    <li
                      key={s.order}
                      onClick={() => toggleStep(s.order)}
                      className={cn(
                        'glass flex cursor-pointer gap-4 rounded-2xl p-4 transition',
                        checked ? 'border-teal/50 bg-teal/10' : 'hover:border-gold/40'
                      )}
                    >
                      <div
                        className={cn(
                          'grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold',
                          checked ? 'bg-teal text-night' : 'bg-gold text-night'
                        )}
                      >
                        {checked ? <CheckCircle2 size={18} /> : s.order}
                      </div>
                      <div>
                        <div className={cn('font-semibold', checked && 'line-through opacity-75')}>{s.title}</div>
                        <p className="text-sm text-white/70">{s.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="space-y-5">
              {guide.slug === 'cpr-adult' && <CprMetronome />}

              {/* Incident / Burn / Seizure Care Timer */}
              <div className="glass-strong rounded-3xl p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold">
                  <Clock size={14} /> Care &amp; Episode Timer
                </div>
                <div className="font-mono text-4xl font-bold text-white">
                  {mm}:{ss}
                </div>
                <p className="mt-1 text-xs text-white/50">
                  Track burn cooling (20m), CPR swap (2m), or seizure duration (&gt;5m = call 112).
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button className="px-5 py-2" onClick={() => setTimerOn((v) => !v)}>
                    {timerOn ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                    {timerOn ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    variant="glass"
                    className="px-4 py-2"
                    onClick={() => {
                      setTimerOn(false);
                      setTimerSec(0);
                    }}
                  >
                    <RotateCcw size={15} />
                  </Button>
                </div>
              </div>

              {guide.dontDo.length > 0 && (
                <div className="rounded-3xl border border-alert/30 bg-alert/10 p-5">
                  <div className="mb-2 font-semibold text-alert-soft">Do Not</div>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/75">
                    {guide.dontDo.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>
              )}

              {guide.warnings.length > 0 && (
                <div className="rounded-3xl border border-gold/30 bg-gold/10 p-5">
                  <div className="mb-2 font-semibold text-gold">Remember</div>
                  <ul className="list-disc space-y-1.5 pl-5 text-sm text-white/75">
                    {guide.warnings.map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
