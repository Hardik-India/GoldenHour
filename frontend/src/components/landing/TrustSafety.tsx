'use client';

import { motion } from 'framer-motion';
import { BadgeCheck, Flag, Lock, ShieldCheck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';

const items = [
  {
    icon: BadgeCheck,
    title: 'Verified volunteers',
    text: 'Responders submit first-aid or medical certifications and pass admin verification before receiving any emergency alerts.',
    badge: 'Admin Approved',
    pct: '100%',
  },
  {
    icon: Lock,
    title: 'Privacy first',
    text: 'Your GPS location is shared strictly during an active SOS and only with the responders and ambulance assisting you.',
    badge: 'Scoped GPS',
    pct: 'Zero Passive Track',
  },
  {
    icon: Flag,
    title: 'Abuse protection',
    text: 'SOS rate limits, false-alarm reporting, and live admin moderation keep critical emergency channels clean.',
    badge: 'Anti-Spam',
    pct: 'Active Guard',
  },
  {
    icon: ShieldCheck,
    title: 'Works with 112 / 108',
    text: 'GoldenHour bridges the crucial first minutes alongside official emergency services—it never replaces them.',
    badge: '112 / 108 Ready',
    pct: 'Compliant',
  },
];

export function TrustSafety() {
  return (
    <section className="container-x py-24">
      <SectionHeading
        eyebrow="Trust and safety"
        title={<>Built to be <span className="text-gold-gradient">trusted</span></>}
        sub="Emergency infrastructure requires strict verification, privacy boundaries, and responsible guardrails."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, idx) => (
          <Reveal key={item.title} delay={idx * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="gh-card-glow glass flex h-full flex-col justify-between rounded-3xl border border-teal/15 p-6 hover:border-teal/55 hover:shadow-glow-teal"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-teal/25 bg-teal/10 text-teal">
                    <item.icon size={24} />
                  </div>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mb-1.5 font-semibold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{item.text}</p>
              </div>
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-[11px] text-white/45">
                  <span>Safeguard</span>
                  <span className="font-semibold text-teal">{item.pct}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: '15%' }}
                    whileInView={{ width: '92%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: idx * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                  />
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
