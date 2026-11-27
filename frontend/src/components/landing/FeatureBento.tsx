'use client';

import { motion } from 'framer-motion';
import { Ambulance, Droplets, Hospital, Languages, MapPinned, Siren, Stethoscope, WifiOff } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { cn } from '@/lib/utils';

function BentoCard({
  className,
  icon: Icon,
  title,
  text,
  tone,
  badge,
  children,
}: {
  className?: string;
  icon: React.ElementType;
  title: string;
  text: string;
  tone: 'red' | 'gold' | 'teal';
  badge?: string;
  children?: React.ReactNode;
}) {
  const styles = {
    red: 'hover:border-alert/60 hover:shadow-glow-red text-alert border-alert/15 bg-gradient-to-br from-alert/[0.08] via-white/[0.03] to-transparent',
    gold: 'hover:border-gold/60 hover:shadow-glow-gold text-gold border-gold/15 bg-gradient-to-br from-gold/[0.08] via-white/[0.03] to-transparent',
    teal: 'hover:border-teal/60 hover:shadow-glow-teal text-teal border-teal/15 bg-gradient-to-br from-teal/[0.08] via-white/[0.03] to-transparent',
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn(
        'gh-card-glow group relative flex flex-col justify-between rounded-3xl border p-6 backdrop-blur-xl',
        styles[tone],
        className
      )}
    >
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-night-800/80 shadow-inner transition group-hover:scale-110">
            <Icon size={23} />
          </div>
          {badge && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/75">
              {badge}
            </span>
          )}
        </div>
        <h3 className="mb-1.5 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-white/65">{text}</p>
      </div>
      {children && <div className="mt-5">{children}</div>}
    </motion.div>
  );
}

const scripts = ['हिन्दी', 'বাংলা', 'தமிழ்', 'తెలుగు', 'मराठी', 'English'];

export function FeatureBento() {
  return (
    <section id="features" className="container-x py-24">
      <SectionHeading
        eyebrow="Core Capabilities"
        title={<>Everything needed in the <span className="text-gold-gradient">first minutes</span></>}
        sub="Eight synchronized life-saving modules engineered to compress response time from panic to handoff."
      />

      <Reveal>
        {/* Balanced 12-column Bento: Row 1 (6+3+3), Row 2 (4+4+4), Row 3 (6+6) — ZERO empty gaps */}
        <div className="grid gap-5 lg:grid-cols-12">
          <BentoCard
            className="lg:col-span-6"
            tone="red"
            badge="Live Mesh"
            icon={Siren}
            title="One-tap SOS with live tracking"
            text="Instant GPS lock, automatic triage severity, and simultaneous alerts to verified first-aiders, ambulances, and hospitals on one shared map."
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-900/75 p-3.5">
              <div className="flex items-center gap-3">
                {[0, 0.5, 1.0].map((d) => (
                  <span key={d} className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-alert">
                    <span className="absolute inset-0 animate-ripple rounded-full bg-alert" style={{ animationDelay: `${d}s` }} />
                  </span>
                ))}
                <span className="text-xs font-medium text-white/80">3 responders converged</span>
              </div>
              <div className="flex gap-1.5 text-[11px]">
                <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-teal">Aarav · 1.4m</span>
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-gold">ALS Amb · 3m</span>
              </div>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-3"
            tone="red"
            badge="110 BPM"
            icon={Stethoscope}
            title="Guided CPR"
            text="Audio-visual 110 BPM compression beat with voice steps. Works 100% offline."
          >
            <div className="flex items-center justify-between rounded-2xl border border-alert/20 bg-night-900/75 px-4 py-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-full bg-red-btn text-sm font-bold text-white shadow-glow-red"
                style={{ animation: 'gh-beat 0.545s ease-in-out infinite' }}
              >
                ♥
              </div>
              <div className="flex items-end gap-1">
                {[16, 28, 12, 34, 20, 26, 14].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-alert/80"
                    style={{ height: h, animation: `twinkle 1.1s ease-in-out ${i * 0.14}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-3"
            tone="gold"
            badge="15s Flow"
            icon={MapPinned}
            title="Smart Triage"
            text="Four rapid yes/no checks classify severity and surface instant pre-arrival care."
          >
            <div className="grid grid-cols-4 gap-1.5 rounded-2xl border border-gold/20 bg-night-900/75 p-2.5 text-center text-[10px] font-semibold">
              <span className="rounded-lg bg-teal/20 py-1.5 text-teal">LOW</span>
              <span className="rounded-lg bg-gold/20 py-1.5 text-gold">MED</span>
              <span className="rounded-lg bg-orange-500/25 py-1.5 text-orange-300">HIGH</span>
              <span className="animate-pulse rounded-lg bg-alert/30 py-1.5 text-alert-soft ring-1 ring-alert/60">CRIT</span>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-4"
            tone="teal"
            badge="Bed & Trauma"
            icon={Hospital}
            title="Hospital Match"
            text="Routes to the nearest ready hospital with trauma level, open ICU beds, and verified blood stock."
          >
            <div className="space-y-2 rounded-2xl border border-teal/20 bg-night-900/75 p-3 text-xs">
              <div className="flex justify-between text-white/80">
                <span>Trauma L1 · ICU Ready</span>
                <span className="text-teal">1.8 km</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: '22%' }}
                  whileInView={{ width: '86%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-teal to-gold"
                />
              </div>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-4"
            tone="red"
            badge="Rare HH Channel"
            icon={Droplets}
            title="Blood Link"
            text="Compatible, cool-down-eligible donors nearby get instant requests—with 3x radius for rare groups like Bombay (HH)."
          >
            <div className="flex flex-wrap gap-1.5">
              {['O-', 'O+', 'A+', 'B-', 'AB+', 'HH'].map((bg, i) => (
                <span
                  key={bg}
                  className="rounded-full border border-alert/35 bg-alert/15 px-2.5 py-1 text-xs font-semibold text-alert-soft"
                  style={{ animation: `twinkle 2.4s ease-in-out ${i * 0.3}s infinite` }}
                >
                  {bg}
                </span>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-4"
            tone="gold"
            badge="Live ETA"
            icon={Ambulance}
            title="Ambulance Dispatch"
            text="Auto-dispatches the nearest available ALS/BLS unit with live map movement from dispatch to handoff."
          >
            <div className="relative flex h-9 items-center overflow-hidden rounded-full border border-gold/25 bg-night-900/75 px-3">
              <div className="h-0.5 w-full bg-white/15" />
              <div className="animate-beam absolute left-0 h-1.5 w-16 rounded-full bg-gradient-to-r from-transparent via-gold to-alert" />
              <span className="relative z-10 ml-auto rounded-full bg-night-800 px-2.5 py-0.5 text-[10px] font-semibold text-gold">
                ALS · ETA 3m
              </span>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-6"
            tone="teal"
            badge="2G & Offline Ready"
            icon={WifiOff}
            title="Low Bandwidth & Offline Mode"
            text="Text-first emergency flows, offline-cached first-aid protocols, and 1-tap WhatsApp/SMS GPS fallback when mobile data drops."
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-teal">Offline CPR Guide</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">Payload &lt; 40 KB</span>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold">1-Tap SMS GPS</span>
            </div>
          </BentoCard>

          <BentoCard
            className="lg:col-span-6"
            tone="gold"
            badge="Voice + Regional"
            icon={Languages}
            title="Multilingual Voice Guidance"
            text="Spoken step-by-step first-aid instructions and calm prompts across major Indian languages so bystanders never freeze."
          >
            <div className="flex flex-wrap gap-2">
              {scripts.map((lang, i) => (
                <motion.span
                  key={lang}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.6, delay: i * 0.22, repeat: Infinity }}
                  className="rounded-xl border border-gold/25 bg-night-900/75 px-3 py-1.5 text-xs font-medium text-gold-soft"
                >
                  {lang}
                </motion.span>
              ))}
            </div>
          </BentoCard>
        </div>
      </Reveal>
    </section>
  );
}
