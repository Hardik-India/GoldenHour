'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const BPM = 110; // recommended compression rate is 100 to 120 per minute

export function CprMetronome() {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!running) return;
    const interval = 60000 / BPM;
    const beep = () => {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = ctxRef.current || new AC();
        const ctx = ctxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } catch {
        /* audio unavailable: visual beat still works */
      }
      setCount((c) => (c % 30) + 1);
    };
    beep();
    const id = setInterval(beep, interval);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div className="glass rounded-3xl p-6 text-center">
      <p className="mb-4 text-sm text-white/60">Push on the beat: {BPM} compressions per minute</p>
      <div
        key={count}
        className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-red-btn text-4xl font-bold shadow-glow-red"
        style={{ animation: running ? 'gh-beat 0.545s ease-out' : undefined }}
      >
        {running ? count : '♥'}
      </div>
      <p className="mt-3 text-xs text-white/50">{running ? 'Compression count (30 then rescue breaths if trained)' : 'Press start'}</p>
      <Button className="mt-5" onClick={() => { setCount(0); setRunning((r) => !r); }}>
        {running ? <><Pause size={16} /> Stop</> : <><Play size={16} fill="currentColor" /> Start metronome</>}
      </Button>
    </div>
  );
}
