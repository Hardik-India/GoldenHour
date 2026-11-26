# Stage 9 - Landing page (the wow moment)

Reference: `docs/reference/landing-hero-reference.png`

```
[Paste 00_MASTER_CONTEXT first]

TASK: Build the landing page at src/app/page.tsx so a viewer says "wow" in 3 seconds. Minimal text, emotional, cinematic. Recreate the reference image in CODE with LIVE elements.

HERO (components/landing/Hero.tsx) - built on the reference artwork
- Use frontend/public/images/hero-bg.jpg: the approved reference image with its baked-in nav, headline and buttons removed (text-free). Never put text inside the image.
- Desktop: a fixed 1672x941 design canvas scaled to the viewport width (ResizeObserver + CSS transform) so overlays stay glued to the artwork. Mobile: the artwork as a dimmed cover background with stacked content and a floating phone.
- Headline exactly: "When every minute counts, someone nearby can save a life." with "every minute" in a glowing gold gradient. Two buttons ONLY: red "Try the Live Demo" and glass "Become a Responder". No subtitle, no trust ticks, no stat cards under the hero.
- LIVE phone screen: a SVG radar (components/landing/LiveRadar.tsx) perspective-warped onto the phone in the artwork with a CSS matrix3d computed from the phone screen's four corner points. Radar: street grid, expanding SOS ripples, 4 gold responders travelling along routes (SVG animateMotion), ticking timer chip, ECG, status card.
- Extra live layers on the artwork: red heartbeat line with a travelling white pulse running into India, pulsing red city node, flashing red/blue ambulance lights, glow on the phone spark, a soft top fade under the navbar, and a light animated rain layer.
- Navbar: wide floating glass pill (max 1620px) with Home active in gold with underline.

OTHER SECTIONS (in order)
2. HowItWorks: SOS -> neighbours alerted -> help arrives live; connected gradient line.
3. DemoSimulator (id="demo"): SVG city map; button "Simulate accident"; timeline fills as responders accept and move to the SOS, ambulance dispatches and arrives; timer; replay.
4. FeatureBento: 8 hover-glow tiles (SOS tracking, Guided CPR with beating circle at 110 BPM, Smart triage, Hospital match, Blood Link, Ambulance dispatch, Low bandwidth, Many languages).
5. BloodSpotlight: glowing blood drop with orbiting donor badges and "3 donors found within 2 km" chip; all blood groups incl. Bombay (HH).
6. ImpactPreview: fetch /api/stats/impact, fall back to clearly labelled sample numbers.
7. TrustSafety (4 cards), JoinCTA (glow blobs), Faq (accordion), Footer (112/108, disclaimer, giant faded "Every minute counts").
Navbar: floating glass pill that shrinks on scroll, mobile menu.

QUALITY: 60fps, no layout shift, respects reduced motion, mobile-first, Lighthouse accessibility >= 90, always show the disclaimer "GoldenHour supports emergency services. It does not replace them."

ACCEPTANCE: side by side with the reference image, mood and layout match; the phone map visibly animates; the demo simulator runs end to end without login.
```
