'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users } from 'lucide-react';
import { LiveRadar } from './LiveRadar';
import { PhoneMock } from './PhoneMock';
import { LogoMark } from '@/components/ui/Logo';

const W = 1672;
const H = 941;

// Perspective-warps the live 300x620 SVG radar precisely onto the tilted phone screen in hero-bg.jpg
const PHONE_MATRIX =
  'matrix3d(0.62056641,-0.02021675,0,-0.0001268086,-0.51181785,0.84432886,0,-0.0001841127,0,0,1,0,1352.0000,210.0000,0,1)';

const ECG_PATH =
  'M830 262 H874 L886 262 L900 226 L916 294 L932 246 L944 262 H1000 C1050 258 1090 244 1122 222';

function useCoverStage() {
  const [stage, setStage] = useState<{ scale: number; top: number; height: number } | null>(null);

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = Math.max(660, Math.min(window.innerHeight, 960));
      const scaleX = vw / W;
      const scaleY = vh / H;
      const coverScale = Math.min(Math.max(scaleX, scaleY), scaleY * 1.28);
      const renderedH = H * coverScale;
      const top = Math.min(0, (vh - renderedH) * 0.78 + 4);
      setStage({ scale: coverScale, top, height: vh });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return stage;
}

function PhoneHeader() {
  return (
    <>
      <div className="absolute left-6 top-[22px] text-[13px] font-semibold text-white">9:41</div>
      <div className="absolute right-6 top-[24px] flex items-center gap-1.5 text-white/90">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.3" y="5" width="3" height="6" rx="1" />
          <rect x="8.6" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" stroke="currentColor">
          <rect x="0.5" y="0.5" width="18" height="10" rx="3" />
          <rect x="2" y="2" width="14" height="7" rx="1.5" fill="currentColor" stroke="none" />
          <rect x="20" y="3.5" width="2" height="4" rx="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div className="absolute left-5 top-[52px] flex items-center gap-1.5">
        <LogoMark size={30} />
        <span className="text-[17px] font-semibold tracking-tight text-white">
          <span className="text-gold">Golden</span>Hour
        </span>
      </div>
      <div className="absolute right-6 top-[60px] space-y-[5px]">
        <div className="h-[2.5px] w-6 rounded bg-white" />
        <div className="h-[2.5px] w-6 rounded bg-white" />
        <div className="h-[2.5px] w-6 rounded bg-white" />
      </div>
    </>
  );
}

export function Hero() {
  const stage = useCoverStage();

  return (
    <section id="home" className="relative isolate overflow-hidden bg-[#070b15]">
      {/* ================= DESKTOP: Full-Bleed Edge-to-Edge Stage ================= */}
      <div
        className="relative hidden w-full overflow-hidden lg:block"
        style={{ height: stage ? stage.height : '100vh' }}
      >
        {/* Seamless blurred full-bleed backdrop for ultra-wide monitors (>21:9) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full scale-105 select-none object-cover opacity-50 blur-lg"
          draggable={false}
        />

        {/* Edge-to-edge artwork stage positioned so lower characters remain visible */}
        <div
          className="absolute left-1/2"
          style={{
            top: stage?.top ?? 0,
            width: W,
            height: H,
            transform: `translateX(-50%) scale(${stage?.scale ?? 1})`,
            transformOrigin: 'top center',
            opacity: stage ? 1 : 0,
            transition: 'opacity .35s ease',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-bg.jpg"
            alt=""
            width={W}
            height={H}
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />

          <div
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: 135,
              background: 'linear-gradient(rgba(7,11,21,.92), rgba(7,11,21,0))',
            }}
          />

          {/* Animated rain overlay */}
          <div className="rain-layer animate-rain pointer-events-none absolute inset-0" style={{ opacity: 0.45 }} />

          {/* Flashing ambulance strobe lights */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: 28,
              top: 572,
              width: 94,
              height: 94,
              background: 'radial-gradient(circle, rgba(255,50,60,.95), transparent 65%)',
              mixBlendMode: 'screen',
              animation: 'gh-flash 0.9s steps(1) infinite',
            }}
          />
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              left: 100,
              top: 578,
              width: 94,
              height: 94,
              background: 'radial-gradient(circle, rgba(70,130,255,.95), transparent 65%)',
              mixBlendMode: 'screen',
              animation: 'gh-flash 0.9s steps(1) infinite',
              animationDelay: '0.45s',
            }}
          />

          {/* Live heartbeat line + pulsing India city node + phone spark */}
          <svg className="pointer-events-none absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <filter id="hg" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={ECG_PATH} fill="none" stroke="#FF3B4E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#hg)" />
            <path
              d={ECG_PATH}
              pathLength="1000"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="70 1000"
              filter="url(#hg)"
            >
              <animate attributeName="stroke-dashoffset" from="70" to="-1000" dur="2.8s" repeatCount="indefinite" />
            </path>
            {[0, 0.9, 1.8].map((b) => (
              <circle key={b} cx="1122" cy="222" r="8" fill="none" stroke="#FF3B4E" strokeWidth="2.5">
                <animate attributeName="r" values="8;48" dur="2.7s" begin={`${b}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2.7s" begin={`${b}s`} repeatCount="indefinite" />
              </circle>
            ))}
            <circle cx="586" cy="726" r="16" fill="#FFB938" opacity="0.55" filter="url(#hg)">
              <animate attributeName="r" values="10;26;10" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.75;0.15;0.75" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>

          {/* Perspective-warped LIVE phone screen */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 300,
              height: 620,
              transformOrigin: '0 0',
              transform: PHONE_MATRIX,
              borderRadius: 36,
              overflow: 'hidden',
              background: '#070b15',
              boxShadow: '0 0 0 3px #04060b',
            }}
          >
            <div style={{ position: 'absolute', top: 60, left: 0, width: 300, height: 560 }}>
              <LiveRadar className="block h-[560px] w-[300px]" />
            </div>
            <div
              style={{
                position: 'absolute',
                inset: '0 0 auto 0',
                height: 100,
                background: 'linear-gradient(#070b15 55%, transparent)',
              }}
            />
            <PhoneHeader />
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: '50%',
                width: 98,
                height: 24,
                borderRadius: 12,
                background: '#000',
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        </div>

        {/* Light scrim behind top-left copy + minimal bottom edge blend */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#070b15]/50 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#070b15]/85 to-transparent" />

        {/* Upper-left Hero Copy + Elevated Action Buttons (shifted slightly left) */}
        <div className="container-x relative z-10 pt-24 xl:pt-28">
          <div className="max-w-2xl lg:-ml-6 xl:-ml-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-alert/40 bg-alert/15 px-4 py-1.5 text-xs font-medium text-alert-soft backdrop-blur-md"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-alert" />
              India&apos;s Live Community First-Response &amp; Blood Link Mesh
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[42px] font-semibold leading-[1.08] tracking-tight text-white xl:text-[52px]"
              style={{ textShadow: '0 4px 28px rgba(0,0,0,.7)' }}
            >
              When{' '}
              <span className="text-gold-gradient" style={{ filter: 'drop-shadow(0 0 22px rgba(255,185,56,.48))' }}>
                every minute
              </span>
              <br />
              counts, someone
              <br />
              nearby can save a life.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-6 flex flex-wrap gap-3.5"
            >
              <Link
                href="#demo"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-red-btn px-7 py-3.5 text-base font-medium text-white shadow-glow-red transition hover:scale-[1.02] hover:brightness-110"
              >
                <Play size={18} fill="currentColor" /> Try the Live Demo <ArrowRight size={17} />
              </Link>
              <Link
                href="/register?role=responder"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/50 bg-night/60 px-7 py-3.5 text-base font-medium text-white backdrop-blur-md transition hover:border-gold/70 hover:bg-white/10"
              >
                <Users size={18} /> Become a Responder <ArrowRight size={17} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE / TABLET ================= */}
      <div className="relative lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.jpg"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full select-none object-cover object-[75%_center] opacity-60"
          draggable={false}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-night/70 via-night/60 to-[#070b15]" />
        <div className="rain-layer animate-rain absolute inset-0 -z-10" />

        <div className="container-x pb-14 pt-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-alert/40 bg-alert/15 px-3.5 py-1 text-[11px] font-medium text-alert-soft">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-alert" />
            Live Community Emergency Mesh
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-semibold leading-[1.12] sm:text-5xl"
          >
            When{' '}
            <span className="text-gold-gradient" style={{ filter: 'drop-shadow(0 0 18px rgba(255,185,56,.5))' }}>
              every minute
            </span>{' '}
            counts, someone nearby can save a life.
          </motion.h1>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-btn px-7 py-3.5 text-base font-medium shadow-glow-red"
            >
              <Play size={18} fill="currentColor" /> Try the Live Demo <ArrowRight size={18} />
            </Link>
            <Link
              href="/register?role=responder"
              className="glass inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-medium"
            >
              <Users size={18} /> Become a Responder
            </Link>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="animate-float">
              <PhoneMock>
                <div className="flex items-center justify-between px-5 pb-1 pt-9 text-[11px] text-white/70">
                  <span>9:41</span>
                  <span className="font-semibold">
                    <span className="text-gold">Golden</span>Hour
                  </span>
                  <span>●●●</span>
                </div>
                <LiveRadar className="block w-full" />
              </PhoneMock>
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] text-white/45">
            GoldenHour supports emergency services. It does not replace them. Call 112 / 108 first.
          </p>
        </div>
      </div>
    </section>
  );
}