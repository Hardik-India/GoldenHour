'use client';

import { useEffect, useState } from 'react';

const responders = [
  { path: 'M40 150 Q 70 270 150 300', dur: 7, begin: 0 },
  { path: 'M262 130 Q 240 250 150 300', dur: 8.5, begin: 1.2 },
  { path: 'M255 470 Q 220 360 150 300', dur: 6.5, begin: 2.4 },
  { path: 'M38 455 Q 90 360 150 300', dur: 9, begin: 0.6 },
];

/** Animated SVG "live radar" shown inside the phone. Pure SVG + SMIL, no libraries. */
export function LiveRadar({ className }: { className?: string }) {
  const [sec, setSec] = useState(108);

  useEffect(() => {
    const id = setInterval(() => setSec((s) => (s <= 0 ? 108 : s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(sec / 60)).padStart(2, '0');
  const ss = String(sec % 60).padStart(2, '0');
  const eta = Math.max(1, Math.ceil(sec / 60));

  return (
    <svg viewBox="0 0 300 560" className={className} role="img" aria-label="Live map of responders heading to an SOS">
      <defs>
        <radialGradient id="sosGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FF7A88" />
          <stop offset="100%" stopColor="#D41F33" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="300" height="560" fill="#0A0F1D" />

      {/* streets */}
      <g stroke="#17233C" strokeWidth="1.4" fill="none">
        <path d="M0 90 H300 M0 180 H300 M0 270 H300 M0 360 H300 M0 450 H300" />
        <path d="M50 0 V560 M120 0 V560 M190 0 V560 M260 0 V560" />
        <path d="M0 520 Q 120 430 300 470" stroke="#1B3A5E" strokeWidth="9" opacity="0.5" />
        <path d="M-10 60 L 310 220" stroke="#1E2D4A" strokeWidth="2" />
        <path d="M-10 330 L 310 520" stroke="#1E2D4A" strokeWidth="2" />
      </g>

      {/* ECG */}
      <polyline
        points="0,64 60,64 72,64 80,44 90,86 100,56 108,64 170,64 182,64 190,40 200,88 210,58 218,64 300,64"
        fill="none"
        stroke="#FFB938"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="520"
        filter="url(#glow)"
      >
        <animate attributeName="stroke-dashoffset" from="520" to="0" dur="2.6s" repeatCount="indefinite" />
      </polyline>

      {/* timer chip */}
      <g transform="translate(88 100)">
        <rect width="124" height="34" rx="17" fill="#3A0F18" stroke="#FF3B4E" strokeOpacity="0.5" />
        <circle cx="20" cy="17" r="6" fill="none" stroke="#fff" strokeWidth="1.5" />
        <path d="M20 13v4l3 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <text x="38" y="23" fill="#fff" fontSize="16" fontWeight="600" fontFamily="inherit">
          {mm}:{ss}
        </text>
      </g>

      {/* ripples */}
      {[0, 0.9, 1.8].map((b) => (
        <circle key={b} cx="150" cy="300" r="20" fill="none" stroke="#FF3B4E" strokeWidth="2">
          <animate attributeName="r" values="20;135" dur="2.7s" begin={`${b}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="2.7s" begin={`${b}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* route trails + travelling responders */}
      {responders.map((r, i) => (
        <g key={i}>
          <path d={r.path} fill="none" stroke="#FFB938" strokeWidth="2" strokeDasharray="5 9" opacity="0.8" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="140" to="0" dur="2s" repeatCount="indefinite" />
          </path>
          <g filter="url(#glow)">
            <circle r="7.5" fill="#FFB938">
              <animateMotion dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" path={r.path} />
            </circle>
            <circle r="3" fill="#fff">
              <animateMotion dur={`${r.dur}s`} begin={`${r.begin}s`} repeatCount="indefinite" path={r.path} />
            </circle>
          </g>
        </g>
      ))}

      {/* SOS core */}
      <g filter="url(#glow)">
        <circle cx="150" cy="300" r="34" fill="url(#sosGrad)" />
        <circle cx="150" cy="300" r="34" fill="none" stroke="#fff" strokeOpacity="0.35" />
        <text x="150" y="306" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700" fontStyle="italic">
          SOS
        </text>
      </g>

      {/* status card */}
      <g transform="translate(28 490)">
        <rect width="244" height="46" rx="16" fill="#101829" stroke="#ffffff" strokeOpacity="0.12" />
        <circle cx="26" cy="23" r="6" fill="#2DD4BF">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x="44" y="20" fill="#fff" fontSize="12" fontWeight="600">
          3 responders nearby
        </text>
        <text x="44" y="36" fill="#FFB938" fontSize="11" fontWeight="600">
          ETA {eta} min
        </text>
      </g>
    </svg>
  );
}
