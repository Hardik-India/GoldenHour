# Stage 8 - Frontend foundation and design system

```
[Paste 00_MASTER_CONTEXT first]

TASK: Create the Next.js 14 app in /frontend (App Router, TypeScript, Tailwind).

1. Load Poppins with next/font/google (weights 300-700) as CSS variable --font-poppins; Tailwind fontFamily.sans uses it.
2. tailwind.config.ts: colours night/alert/gold/teal (+ soft/deep), glow box shadows, gradients (gold-text, red-btn, night-glow), keyframes + animations: ripple, float, rain, ecg, twinkle, orbit, shimmer.
3. globals.css: dark body, custom scrollbar, utility classes .glass, .glass-strong, .text-gold-gradient, .container-x, .input, .label, rain layer, ecg path, reduced-motion media query, dark Leaflet polish, gh-beat keyframe.
4. UI primitives: Button (primary/glass/gold/ghost/teal, optional href), GlassCard, Reveal (Framer Motion scroll reveal), SectionHeading, Logo (heartbeat + clock mark), Notice, EmergencyBanner (112/108 disclaimer).
5. lib: api.ts (axios + bearer interceptor + apiError helper), socket.ts, types.ts, utils.ts. store/auth.ts (zustand with init/setSession/refresh/logout). hooks: useGeolocation (fallback to demo centre), useCountUp.
6. .env.local with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL, default lat/lng, emergency numbers.

ACCEPTANCE: `npm run dev` renders with Poppins, dark theme and working glass/glow utilities.
```
