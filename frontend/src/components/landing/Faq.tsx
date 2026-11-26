'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

const faqs = [
  ['Is GoldenHour free?', 'Yes. It is free for citizens, responders and donors.'],
  ['Does it replace 112 or 108?', 'No. GoldenHour supports emergency services. Always call 112 or 108 first, then raise an SOS so nearby trained people can help in the meantime.'],
  ['How are responders verified?', 'Responders apply with their certifications. An admin reviews and approves them before they can receive alerts.'],
  ['Who can see my location?', 'Only during an active SOS, and only the responders, ambulance and hospital helping with that incident.'],
  ['Who can donate blood through the app?', 'Anyone who registers as a donor, is available, and is past the donation cool-down period. Final eligibility is always decided by the blood bank.'],
  ['Does it work on weak internet?', 'Core screens are text-first and first-aid guides are cached. An SMS fallback is on the roadmap.'],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container-x max-w-3xl py-20">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <div className="space-y-3">
        {faqs.map(([q, a], i) => (
          <div key={q} className="glass overflow-hidden rounded-2xl">
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              {q}
              <ChevronDown className={cn('shrink-0 text-gold transition', open === i && 'rotate-180')} size={20} />
            </button>
            <div className={cn('grid transition-all duration-300', open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm text-white/65">{a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
