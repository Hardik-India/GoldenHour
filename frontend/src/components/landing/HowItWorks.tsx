'use client';

import { motion } from 'framer-motion';
import { BellRing, Route, Siren } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  {
    icon: Siren,
    title: 'One-tap SOS',
    text: 'Share your exact GPS lock and answer 4 rapid yes/no triage checks in under 15 seconds.',
    tone: 'text-alert border-alert/30 bg-alert/10',
    pill: '00:01 · GPS Locked',
    dot: 'bg-alert',
  },
  {
    icon: BellRing,
    title: 'Neighbours alerted',
    text: 'Verified first-aiders within minutes of you get a live radar ping along with the nearest ambulance and hospital.',
    tone: 'text-gold border-gold/30 bg-gold/10',
    pill: '400m · 650m · 1.1km',
    dot: 'bg-gold',
  },
  {
    icon: Route,
    title: 'Help arrives, live',
    text: 'Track responders converging in real time while a voice-guided CPR and bleeding-control screen keeps you steady.',
    tone: 'text-teal border-teal/30 bg-teal/10',
    pill: 'Live ETA · 110 BPM',
    dot: 'bg-teal',
  },
];

export function HowItWorks() {
  return (
    <section className="container-x py-24">
      <SectionHeading
        eyebrow="How it works"
        title={<>From panic to help in <span className="text-gold-gradient">three steps</span></>}
        sub="A zero-friction workflow engineered for shaky hands and high-stress moments."
      />
      <div className="relative grid gap-6 md:grid-cols-3">
        {/* Animated energy beam connecting the 3 steps */}
        <div className="pointer-events-none absolute left-[16%] right-[16%] top-14 hidden h-0.5 overflow-hidden rounded-full bg-white/10 md:block">
          <div className="animate-beam h-full w-1/3 bg-gradient-to-r from-alert via-gold to-teal" />
        </div>

        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.14}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="gh-card-glow glass relative flex h-full flex-col items-center rounded-3xl p-7 text-center hover:border-gold/40 hover:shadow-glow-gold"
            >
              <div className={`relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border ${s.tone}`}>
                <s.icon size={30} />
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-night-900 text-xs font-bold text-white ring-1 ring-white/20">
                  {i + 1}
                </span>
              </div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">STEP 0{i + 1}</div>
              <h3 className="mb-2 text-xl font-semibold text-white">{s.title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{s.text}</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-night-900/70 px-3.5 py-1.5 text-xs font-medium text-white/80">
                <span className={`h-2 w-2 animate-pulse rounded-full ${s.dot}`} />
                {s.pill}
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
