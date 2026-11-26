'use client';

import { BadgeCheck, Lock, Flag, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const items = [
  { icon: BadgeCheck, title: 'Verified volunteers', text: 'Responders submit certifications and are approved by an admin before they can receive alerts.' },
  { icon: Lock, title: 'Privacy first', text: 'Your location is shared only during an active alert, and only with the people helping.' },
  { icon: Flag, title: 'Abuse protection', text: 'Rate limits, false-alarm reporting and account review keep the network trustworthy.' },
  { icon: ShieldCheck, title: 'Works with 112 / 108', text: 'GoldenHour supports emergency services. It never replaces them.' },
];

export function TrustSafety() {
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="Trust and safety" title={<>Built to be <span className="text-gold-gradient">trusted</span></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i, idx) => (
          <Reveal key={i.title} delay={idx * 0.08}>
            <div className="glass h-full rounded-3xl p-6">
              <i.icon className="mb-4 text-teal" size={28} />
              <h3 className="mb-1 font-semibold">{i.title}</h3>
              <p className="text-sm text-white/60">{i.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
