'use client';

import { Ambulance, Hospital, Languages, Siren, Stethoscope, WifiOff, Droplets, MapPinned } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

function Tile({
  className,
  icon: Icon,
  title,
  text,
  tone,
  children,
}: {
  className?: string;
  icon: React.ElementType;
  title: string;
  text: string;
  tone: 'red' | 'gold' | 'teal';
  children?: React.ReactNode;
}) {
  const tones = {
    red: 'hover:shadow-glow-red hover:border-alert/50 text-alert',
    gold: 'hover:shadow-glow-gold hover:border-gold/50 text-gold',
    teal: 'hover:shadow-glow-teal hover:border-teal/50 text-teal',
  };
  return (
    <div
      className={cn(
        'glass group relative flex flex-col overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1',
        tones[tone],
        className
      )}
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/5">
        <Icon size={24} />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-white/60">{text}</p>
      {children}
    </div>
  );
}

export function FeatureBento() {
  return (
    <section id="features" className="container-x py-20">
      <SectionHeading
        eyebrow="Features"
        title={<>Everything needed in the <span className="text-gold-gradient">first minutes</span></>}
      />
      <Reveal>
        <div className="grid auto-rows-[minmax(190px,auto)] gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Tile className="md:col-span-2" tone="red" icon={Siren} title="One-tap SOS with live tracking" text="Location, severity and an automatic ambulance dispatch for serious cases. Everyone follows one shared live map.">
            <div className="mt-auto flex items-end gap-3 pt-6">
              {[0, 0.6, 1.2].map((d) => (
                <span key={d} className="relative h-3 w-3 rounded-full bg-alert">
                  <span className="absolute inset-0 animate-ripple rounded-full bg-alert" style={{ animationDelay: `${d}s` }} />
                </span>
              ))}
              <span className="text-xs text-white/40">3 responders accepted</span>
            </div>
          </Tile>

          <Tile tone="red" icon={Stethoscope} title="Guided CPR" text="Voice-led steps with a 110 BPM compression beat. Works offline.">
            <div className="mt-auto pt-6">
              <div
                className="mx-auto h-10 w-10 rounded-full bg-alert/80 shadow-glow-red"
                style={{ animation: 'gh-beat 0.545s ease-in-out infinite' }}
              />
            </div>
          </Tile>

          <Tile tone="gold" icon={MapPinned} title="Smart triage" text="Four quick questions decide severity and what to do while help is on the way." />

          <Tile tone="teal" icon={Hospital} title="Hospital match" text="Nearest hospital with trauma care, ICU and blood stock, not just the closest door." />

          <Tile className="md:col-span-2" tone="red" icon={Droplets} title="Blood Link" text="Hospitals and families post a need; compatible, eligible donors nearby get alerted. Rare groups like Bombay (HH) search much wider." />

          <Tile tone="gold" icon={Ambulance} title="Ambulance dispatch" text="Nearest available unit, live ETA and status from dispatch to handoff." />

          <Tile tone="teal" icon={WifiOff} title="Low bandwidth mode" text="Text-first screens, cached first-aid guides and SMS fallback for patchy networks." />

          <Tile tone="gold" icon={Languages} title="Many languages" text="Hindi, Bengali, Tamil and more, including voice prompts." />
        </div>
      </Reveal>
    </section>
  );
}
