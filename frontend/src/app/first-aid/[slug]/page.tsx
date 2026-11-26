'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { CprMetronome } from '@/components/app/CprMetronome';
import { EmergencyBanner } from '@/components/ui/EmergencyBanner';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import type { FirstAidGuide } from '@/lib/types';

export default function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const [guide, setGuide] = useState<FirstAidGuide | null>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    api.get(`/first-aid/${slug}`).then(({ data }) => setGuide(data.guide)).catch(() => undefined);
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); };
  }, [slug]);

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

  return (
    <AppShell requireAuth={false}>
      <div className="mx-auto max-w-3xl space-y-6">
        {!guide ? (
          <p className="text-white/50">Loading guide...</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">{guide.title}</h1>
                <p className="text-sm text-white/55">{guide.summary}</p>
              </div>
              <Button variant="glass" className="px-4 py-2" onClick={toggleSpeech}>
                {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />} {speaking ? 'Stop' : 'Read aloud'}
              </Button>
            </div>

            <EmergencyBanner />
            {guide.slug === 'cpr-adult' && <CprMetronome />}

            <ol className="space-y-3">
              {guide.steps.map((s) => (
                <li key={s.order} className="glass flex gap-4 rounded-2xl p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-night">{s.order}</div>
                  <div>
                    <div className="font-semibold">{s.title}</div>
                    <p className="text-sm text-white/65">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            {guide.dontDo.length > 0 && (
              <div className="rounded-2xl border border-alert/30 bg-alert/10 p-4">
                <div className="mb-1 font-semibold text-alert-soft">Do not</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">{guide.dontDo.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            )}
            {guide.warnings.length > 0 && (
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
                <div className="mb-1 font-semibold text-gold">Remember</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-white/70">{guide.warnings.map((d) => <li key={d}>{d}</li>)}</ul>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
