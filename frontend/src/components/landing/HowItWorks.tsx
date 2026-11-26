'use client';

import { BellRing, Siren, Route } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  {
    icon: Siren,
    title: 'One tap SOS',
    text: 'Press the button. Your location is shared and a 15 second triage tells us how serious it is.',
    tone: 'text-alert',
  },
  {
    icon: BellRing,
    title: 'Neighbours are alerted',
    text: 'Verified first-aiders within minutes of you are notified, along with the nearest ambulance and hospital.',
    tone: 'text-gold',
  },
  {
    icon: Route,
    title: 'Help arrives, live',
    text: 'Watch responders move toward you in real time while a guided CPR and bleeding-control screen keeps you steady.',
    tone: 'text-teal',
  },
];

export function HowItWorks() {
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="How it works" title={<>From panic to help in <span className="text-gold-gradient">three steps</span></>} />
      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-alert via-gold to-teal opacity-40 md:block" />
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.15}>
            <div className="glass relative h-full rounded-3xl p-7 text-center">
              <div className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 ${s.tone}`}>
                <s.icon size={30} />
              </div>
              <div className="mb-1 text-xs font-semibold text-white/40">STEP {i + 1}</div>
              <h3 className="mb-2 text-xl font-semibold">{s.title}</h3>
              <p className="text-sm text-white/60">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
